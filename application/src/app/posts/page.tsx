import Container from '@/components/container'
import { Loader2 } from 'lucide-react'

export default function Component() {
  return (
    <Container>
    <div className="flex flex-col items-center justify-center bg-gradient-to-b text-center">
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Under Construction
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          Please check back soon!
        </p>
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
    </div>
    </Container>
  )
}