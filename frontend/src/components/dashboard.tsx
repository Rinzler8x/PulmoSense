'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChartIcon, Activity, Zap, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Button } from "@/components/ui/button"
import { createClient } from '@supabase/supabase-js'
import { format, subMonths, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { useRouter } from 'next/navigation'

// Import components correctly
import { Badge } from "./ui/badge"

// Type definitions for prediction data
interface PredictionData {
  id: number;
  user_id: string;
  image_url: string;
  prediction: string;
  confidence: number;
  created_at: string;
}

// Additional interfaces for analytics data
interface MonthlyData {
  name: string;
  scans: number;
}

interface ResultsDistribution {
  name: string;
  value: number;
}

interface OverviewMetrics {
  totalScans: number;
  positiveDetections: number;
  processingSpeed: number;
  totalScansChange: number;
  positiveDetectionsChange: number;
  processingSpeedChange: number;
}

// Initialize Supabase client - you should move these to environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key'
const supabase = createClient(supabaseUrl, supabaseKey)

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD']

// Type-safe prediction color mapping
const predictionColorMap: Record<string, "destructive" | "success" | "secondary" | "default" | "outline"> = {
  'adenocarcinoma': 'destructive',
  'large_cell_carcinoma': 'destructive',
  'squamous_cell_carcinoma': 'destructive',
  'normal': 'success'
}

// Month abbreviations for chart display
const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function Dashboard() {
  const [recentScans, setRecentScans] = useState<PredictionData[]>([])
  const [recentActivity, setRecentActivity] = useState<PredictionData[]>([])
  const [filterPrediction, setFilterPrediction] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [scanResultsData, setScanResultsData] = useState<ResultsDistribution[]>([])
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetrics>({
    totalScans: 0,
    positiveDetections: 0,
    processingSpeed: 0,
    totalScansChange: 0,
    positiveDetectionsChange: 0,
    processingSpeedChange: 0
  })
  const router = useRouter()

  // Check authentication on component mount
  useEffect(() => {
    async function checkUser() {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        // No valid session, redirect to authentication page
        router.push('/authentication')
        return
      }
      
      setUser(session.user)
    }
    
    checkUser()
  }, [router])

  // Only fetch data if user is authenticated
  useEffect(() => {
    if (user) {
      fetchRecentScans()
      fetchRecentActivity()
      fetchAnalyticsData()
      fetchOverviewMetrics()
    }
  }, [user, filterPrediction, sortOrder])

  // Fetch recent scans from Supabase - modified to only show current user's data
  const fetchRecentScans = async () => {
    setIsLoading(true)
    
    let query = supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id) // Filter by current user
      .limit(10)
    
    // Apply filters
    if (filterPrediction !== 'all') {
      query = query.eq('prediction', filterPrediction)
    }
    
    // Apply sorting
    if (sortOrder === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (sortOrder === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else if (sortOrder === 'confidence-high') {
      query = query.order('confidence', { ascending: false })
    } else if (sortOrder === 'confidence-low') {
      query = query.order('confidence', { ascending: true })
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching recent scans:', error)
    } else {
      setRecentScans(data as PredictionData[] || [])
    }
    
    setIsLoading(false)
  }

  // Fetch recent activity - modified to only show current user's data
  const fetchRecentActivity = async () => {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id) // Filter by current user
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('Error fetching recent activity:', error)
    } else {
      setRecentActivity(data as PredictionData[] || [])
    }
  }

  // Calculate average processing speed from predictions data
  const calculateProcessingSpeed = async (userId: string): Promise<number> => {
    const { data, error } = await supabase
      .from('predictions')
      .select('speed')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
  
    if (error) {
      console.error('Error fetching prediction speeds:', error);
      return 0;
    }
  
    const speeds = data?.map((entry) => parseFloat(entry.speed)) || [];
    const total = speeds.reduce((sum, val) => sum + val, 0);
    const average = speeds.length > 0 ? total / speeds.length : 0;
    console.log("calculate speed")
    console.log(average)
    return average;
  };

  // Fetch analytics data for charts
  const fetchAnalyticsData = async () => {
    const today = new Date()
    const sixMonthsAgo = subMonths(today, 6)
    
    // Get all predictions for the current user
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching analytics data:', error)
      return
    }
    
    const predictions = data as PredictionData[]
    
    // Process monthly data
    const monthlyCounts = processMonthlyData(predictions)
    setMonthlyData(monthlyCounts)
    
    // Process results distribution
    const resultsDistribution = processResultsDistribution(predictions)
    setScanResultsData(resultsDistribution)
  }
  
  // Process monthly data for bar chart
  const processMonthlyData = (predictions: PredictionData[]): MonthlyData[] => {
    const today = new Date()
    const monthlyData: MonthlyData[] = []
    
    // Create entries for the last 6 months
    for (let i = 6; i >= 0; i--) {
      const monthDate = subMonths(today, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      
      // Count scans for this month
      const scanCount = predictions.filter(prediction => {
        const predictionDate = parseISO(prediction.created_at)
        return isWithinInterval(predictionDate, { start: monthStart, end: monthEnd })
      }).length
      
      monthlyData.push({
        name: monthAbbreviations[monthDate.getMonth()],
        scans: scanCount
      })
    }
    
    return monthlyData
  }
  
  // Process results distribution for pie chart
  const processResultsDistribution = (predictions: PredictionData[]): ResultsDistribution[] => {
    const resultsMap: Record<string, number> = {}
    
    // Count predictions by type
    predictions.forEach(prediction => {
      const predictionType = prediction.prediction
      resultsMap[predictionType] = (resultsMap[predictionType] || 0) + 1
    })
    
    // Format for pie chart
    return Object.entries(resultsMap).map(([predictionType, count]) => ({
      name: predictionType === 'normal' ? 'Normal' : 
            predictionType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count
    }))
  }
  
  // Fetch and calculate overview metrics
const fetchOverviewMetrics = async () => {
  const today = new Date()
  const lastMonth = subMonths(today, 1)
  const twoMonthsAgo = subMonths(today, 2)

  // Get all predictions for current month
  const { data: currentMonthData, error: currentMonthError } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', lastMonth.toISOString())

  // Get all predictions for previous month
  const { data: previousMonthData, error: previousMonthError } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', twoMonthsAgo.toISOString())
    .lt('created_at', lastMonth.toISOString())

  if (currentMonthError || previousMonthError) {
    console.error('Error fetching overview metrics:', currentMonthError || previousMonthError)
    return
  }

  const currentPredictions = currentMonthData as PredictionData[] || []
  const previousPredictions = previousMonthData as PredictionData[] || []

  // Calculate current month metrics
  const totalScans = currentPredictions.length
  const positiveDetections = currentPredictions.filter(
    pred => pred.prediction !== 'normal'
  ).length
  const rawProcessingSpeed = await calculateProcessingSpeed(user.id)
  const processingSpeed = parseFloat(rawProcessingSpeed.toFixed(3))

  // Calculate previous month metrics
  const previousTotalScans = previousPredictions.length
  const previousPositiveDetections = previousPredictions.filter(
    pred => pred.prediction !== 'normal'
  ).length
  const rawPreviousSpeed = await calculateProcessingSpeed(user.id)
  const previousProcessingSpeed = parseFloat(rawPreviousSpeed.toFixed(3))

  // Calculate percentage changes
  const totalScansChange = previousTotalScans === 0 ? 100 :
    ((totalScans - previousTotalScans) / previousTotalScans) * 100

  const positiveDetectionsChange = previousPositiveDetections === 0 ? 100 :
    ((positiveDetections - previousPositiveDetections) / previousPositiveDetections) * 100

  const processingSpeedChange = previousProcessingSpeed === 0 ? 0 :
    parseFloat((((processingSpeed - previousProcessingSpeed) / previousProcessingSpeed) * 100).toFixed(2))

  // Update state
  setOverviewMetrics({
    totalScans,
    positiveDetections,
    processingSpeed,
    totalScansChange,
    positiveDetectionsChange,
    processingSpeedChange
  })
}

  // Export scans as CSV - modified to only export current user's data
  const exportAsCSV = async () => {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id) // Filter by current user
    
    if (error) {
      console.error('Error fetching data for export:', error)
      return
    }
    
    // Format data for CSV
    const headers = ['ID', 'User ID', 'Prediction', 'Confidence', 'Created At', 'Image URL']
    const csvContent = [
      headers.join(','),
      ...(data as PredictionData[]).map(row =>
        [
          row.id,
          row.user_id,
          row.prediction,
          row.confidence,
          row.created_at,
          row.image_url
        ].join(',')
      )
    ].join('\n')
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', `lung-scan-data-${new Date().toISOString().split('T')[0]}.csv`)
    a.click()
  }

  // Generate a PDF report
  const trainModel = () => {
    // Implementation would typically use a library like jsPDF or call a server endpoint
    alert('Data sent to backend for training.....')
  }

  // Gets a badge style based on prediction type - fixed return type
  const getPredictionBadgeVariant = (prediction: string): "destructive" | "success" | "secondary" | "default" | "outline" => {
    return predictionColorMap[prediction] || 'secondary'
  }

  // If not authenticated yet or still checking, show loading
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex space-x-2">
          <Button onClick={exportAsCSV} size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export as CSV
          </Button>
          <Button onClick={trainModel} size="sm">
            Train Model
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports and Training</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Scans
                </CardTitle>
                <BarChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewMetrics.totalScans}</div>
                <p className="text-xs text-muted-foreground">
                  {overviewMetrics.totalScansChange > 0 ? '+' : ''}{overviewMetrics.totalScansChange.toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Positive Detections
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewMetrics.positiveDetections}</div>
                <p className="text-xs text-muted-foreground">
                  {overviewMetrics.positiveDetectionsChange > 0 ? '+' : ''}{overviewMetrics.positiveDetectionsChange.toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Processing Speed
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewMetrics.processingSpeed.toFixed(3)}s</div>
                <p className="text-xs text-muted-foreground">
                  {overviewMetrics.processingSpeedChange > 0 ? '+' : ''}{overviewMetrics.processingSpeedChange.toFixed(3)}s from last month
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Scans</CardTitle>
                <div className="flex items-center space-x-2">
                  <select
                    value={filterPrediction}
                    onChange={(e) => setFilterPrediction(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="all">All Results</option>
                    <option value="normal">Normal</option>
                    <option value="adenocarcinoma">Adenocarcinoma</option>
                    <option value="large_cell_carcinoma">Large Cell Carcinoma</option>
                    <option value="squamous_cell_carcinoma">Squamous Cell Carcinoma</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="confidence-high">Highest Confidence</option>
                    <option value="confidence-low">Lowest Confidence</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : recentScans.length > 0 ? (
                  <div className="space-y-4">
                    {recentScans.map((scan) => (
                      <div key={scan.id} className="flex items-center p-3 rounded-lg border">
                        <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden mr-4">
                          <img
                            src={scan.image_url}
                            alt="Lung scan"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "/placeholder-image.png"; // Fallback image
                            }}
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <div>
                              <Badge variant={getPredictionBadgeVariant(scan.prediction)}>
                                {scan.prediction === 'normal' ? 'Normal' :
                                  scan.prediction.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </Badge>
                              <div className="text-sm mt-1">Confidence: {(scan.confidence * 100).toFixed(2)}%</div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(scan.created_at), 'MMM d, yyyy h:mm a')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No scans found. Try adjusting your filters.
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  You have analyzed {recentActivity.length} scans recently
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-2">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-grow">
                          <div className="text-sm">
                            Scan analyzed: {' '}
                            <Badge variant={getPredictionBadgeVariant(activity.prediction)}>
                              {activity.prediction === 'normal' ? 'Normal' :
                                activity.prediction.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Badge>
                            {activity.confidence && ` with ${(activity.confidence * 100).toFixed(2)}% confidence`}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent activity found.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Scans</CardTitle>
                <CardDescription>Number of scans performed each month</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="scans" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Scan Results Distribution</CardTitle>
                <CardDescription>Distribution of scan results</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scanResultsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {scanResultsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports and Training</CardTitle>
              <CardDescription>
                View, generate reports and train model on new data for your lung scan analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Export Options</h3>
                  <div className="flex space-x-2 mt-2">
                    <Button onClick={exportAsCSV} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export as CSV
                    </Button>
                    <Button onClick={trainModel}>
                      Training Model On New Data
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-lg font-medium">Scheduled Reports</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set up automated reports to be generated and sent to your email on a schedule.
                  </p>
                  <div className="mt-4">
                    <Button>Configure Scheduled Reports</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
