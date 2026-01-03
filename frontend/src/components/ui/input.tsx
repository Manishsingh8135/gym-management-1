import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-white placeholder:text-[#a7a7a7] selection:bg-[#1db954] selection:text-black bg-[#282828] border-transparent h-10 w-full min-w-0 rounded-md border px-4 py-2 text-sm text-white transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "hover:bg-[#3e3e3e] focus:bg-[#3e3e3e] focus:ring-2 focus:ring-white",
        "aria-invalid:ring-[#e91429] aria-invalid:ring-2",
        className
      )}
      {...props}
    />
  )
}

export { Input }
