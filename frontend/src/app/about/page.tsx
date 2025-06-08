// src/app/about/page.tsx
"use client";
import Image, { StaticImageData } from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import rohitProfilePic from "./profilepic/Rohit.jpg"; 
import varadProfilePic from "./profilepic/Varad.jpg"; 
import saileeProfilePic from "./profilepic/Sailee.jpg"; 
import virajProfilePic from "./profilepic/Virajprof.jpg"; 

// Team member type definition
type TeamMember = {
  name: string;
  role: string;
  profilePic: StaticImageData;
  description: string;
  linkedin?: string;
  github?: string;
};

export default function AboutPage() {
  const teamMembers: TeamMember[] = [
    {
      name: "Rohit Bhandari",
      role: "AI/ML & Backend Engineer",
      profilePic: rohitProfilePic,
      description: "Specializes in developing the AI algorithms for lung cancer detection using deep learning.",
      linkedin: "https://linkedin.com/in/rohit-bhandari",
      github: "https://github.com/TheLMNTRIX"
    },
    {
      name: "Varad Kakodkar",
      role: "AI/ML & Backend Engineer",
      profilePic: varadProfilePic,
      description: "Leads the development of AI algorithms and backend infrastructure for accurate diagnosis.",
      linkedin: "https://linkedin.com/in/varad-kakodkar",
      github: "https://github.com/rinzler8x"
    },
    {
      name: "Sailee Phal",
      role: "Full-Stack & AI/ML Engineer",
      profilePic: saileeProfilePic,
      description: "Contributes to AI/ML model implementation and integration, while working on both front-end and back-end development to ensure seamless functionality.",
      linkedin: "https://linkedin.com/in/sailee-phal",
      github: "https://github.com/saileephal"
    },
    {
      name: "Viraj Naik",
      role: "Frontend Engineer",
      profilePic: virajProfilePic,
      description: "Leads frontend development with a focus on creating intuitive interfaces for medical professionals.",
      linkedin: "https://www.linkedin.com/in/virajnaik128",
      github: "https://github.com/naikviraj"
    }
  ];

  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold mb-6">About PulmoSense AI</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          PulmoSense AI is a cutting-edge medical technology project designed to revolutionize
          lung cancer detection through deep neural networks. Our mission is to provide
          early, accurate, and accessible diagnosis tools to improve patient outcomes worldwide.
        </p>
      </div>

      <Tabs defaultValue="mission" className="mb-16">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
          <TabsTrigger value="mission">Our Mission</TabsTrigger>
          <TabsTrigger value="technology">Our Technology</TabsTrigger>
          <TabsTrigger value="impact">Our Impact</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mission" className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Mission Statement</h2>
          <p className="text-gray-700 mb-4">
            At PulmoSense AI, we are committed to developing innovative AI solutions that help
            healthcare professionals detect lung cancer at earlier stages when treatment is most effective.
          </p>
          <p className="text-gray-700">
            We believe that by combining advanced machine learning algorithms with medical expertise,
            we can create tools that are not just accurate but also accessible to healthcare providers
            around the world, regardless of resource constraints.
          </p>
        </TabsContent>
        
        <TabsContent value="technology" className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Our Technology</h2>
          <p className="text-gray-700 mb-4">
            PulmoSense AI utilizes state-of-the-art deep learning models trained on thousands of
            annotated CT scans to identify potential signs of lung cancer.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Advanced Image Recognition</h3>
              <p className="text-sm text-gray-600">
                Our models can detect nodules as small as 5mm with high sensitivity and specificity.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Easy Integration</h3>
              <p className="text-sm text-gray-600">
                PulmoSense AI is designed to integrate seamlessly with existing healthcare IT systems.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="impact" className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Making a Difference</h2>
          <p className="text-gray-700 mb-4">
            Early detection of lung cancer can increase the 5-year survival rate from less than 20% to over 70%.
            Our technology aims to make this level of early detection widely available.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <p className="text-blue-800 font-medium">
              Our goal is to promote sustainable development and minimizing biomedical waste generated from medical tests.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <Card key={member.name} className="overflow-hidden transition-all hover:shadow-md">
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                <Image
                  src={member.profilePic} 
                  alt={member.name}
                  className="object-cover rounded-full mx-auto mt-6 border-4 border-white shadow-sm"
                  style={{ width: '150px', height: '150px' }}
                />
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium text-sm mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.description}</p>
                <div className="flex justify-center space-x-3">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                      </svg>
                    </a>
                  )}
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="text-center py-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Partner With Us</h2>
        <p className="max-w-3xl mx-auto text-gray-700 mb-8">
          We're always looking for healthcare partners, researchers, and institutions interested in
          advancing early lung cancer detection technology. If you'd like to collaborate or learn more,
          please reach out to us.
        </p>
        <a 
          href="mailto:contact@pulmosense.ai" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Contact Us
        </a>
      </section>
    </main>
  );
}