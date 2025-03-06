import './App.css'
import TaskComponent from './TaskComponent'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskComponent />
    </QueryClientProvider>
  )
}

export default App