import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
      <div className="flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © 2025 PulmoSense AI. 
        </p>
        {/* <nav className="flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav> */}
      </div>
    </footer>
  )
}

