import { Separator } from "@/components/ui/separator"
import { DatePickerForm } from "@/components/date-picker"

export default function IndexPage() {
  return (
    <div className="fixed items-center gap-4 py-6 sm:ml-10 md:ml-60 md:py-10">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          AWS AI Recaps
        </h1>
        <p className="text-muted-foreground text-lg">
          Select a date for a recap of the AWS announcements for that day.
        </p>
        <DatePickerForm />
        <Separator className="mt-4" />
      </div>
    </div>
  )
}
