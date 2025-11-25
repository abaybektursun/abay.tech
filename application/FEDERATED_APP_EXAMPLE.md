# 🚀 Federated App Implementation Example
## **Building a Task Manager App Using the Design System**

This example demonstrates how to create a new federated application within your architecture, using all the spacing and component systems we've established.

---

## Step 1: Create the App Structure

```bash
# Create directory structure
mkdir -p src/app/apps/tasks
mkdir -p src/app/apps/tasks/components
mkdir -p src/app/apps/tasks/features
mkdir -p src/app/apps/tasks/lib
mkdir -p src/app/apps/tasks/types
```

---

## Step 2: App Configuration

### `src/app/apps/tasks/config.ts`

```typescript
import { CheckSquare } from 'lucide-react'
import type { AppConfig } from '@/lib/apps/registry'

const tasksConfig: AppConfig = {
  id: 'tasks',
  name: 'Task Manager',
  description: 'Organize your work with smart task management',
  icon: CheckSquare,
  href: '/apps/tasks',
  status: 'live',
  features: [
    'Create and organize tasks',
    'Set priorities and due dates',
    'Track progress with boards',
    'Collaborative workspaces',
  ],
  permissions: ['tasks:read', 'tasks:write'],
}

export default tasksConfig
```

---

## Step 3: App Layout

### `src/app/apps/tasks/layout.tsx`

```tsx
import { TasksProvider } from './providers'
import { TasksNavigation } from './components/navigation'
import { PageSection } from '@/components/layout/page-section'

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TasksProvider>
      <div className="min-h-screen">
        <TasksNavigation />
        <PageSection spacing="default" container>
          {children}
        </PageSection>
      </div>
    </TasksProvider>
  )
}
```

---

## Step 4: Context Provider

### `src/app/apps/tasks/providers.tsx`

```tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { Task, TaskList } from './types'

interface TasksContextType {
  tasks: Task[]
  lists: TaskList[]
  activeList: string | null
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setActiveList: (listId: string) => void
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [lists, setLists] = useState<TaskList[]>([
    { id: 'default', name: 'My Tasks', color: 'blue' },
  ])
  const [activeList, setActiveList] = useState<string | null>('default')

  // Load tasks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('tasks')
    if (stored) {
      setTasks(JSON.parse(stored))
    }
  }, [])

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  return (
    <TasksContext.Provider
      value={{
        tasks,
        lists,
        activeList,
        addTask,
        updateTask,
        deleteTask,
        setActiveList,
      }}
    >
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (!context) {
    throw new Error('useTasks must be used within TasksProvider')
  }
  return context
}
```

---

## Step 5: Type Definitions

### `src/app/apps/tasks/types/index.ts`

```typescript
export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  listId: string
  tags: string[]
  createdAt: string
  updatedAt?: string
  completedAt?: string
}

export interface TaskList {
  id: string
  name: string
  color: string
  icon?: string
  taskCount?: number
}

export interface TaskFilter {
  status?: Task['status'][]
  priority?: Task['priority'][]
  listId?: string
  tags?: string[]
  search?: string
}
```

---

## Step 6: Main Page Component

### `src/app/apps/tasks/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { Plus, Filter, Search } from 'lucide-react'
import { useTasks } from './providers'
import { TaskCard } from './components/task-card'
import { TaskForm } from './components/task-form'
import { TaskFilters } from './components/task-filters'
import { Button, ButtonGroup } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heading, Text } from '@/components/ui/typography'
import { GridSection } from '@/components/layout/page-section'
import { motion, AnimatePresence } from 'framer-motion'

export default function TasksPage() {
  const { tasks, activeList } = useTasks()
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')

  // Filter tasks based on active list and search
  const filteredTasks = tasks.filter((task) => {
    if (activeList && task.listId !== activeList) return false
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    return true
  })

  const tasksByStatus = {
    todo: filteredTasks.filter((t) => t.status === 'todo'),
    'in-progress': filteredTasks.filter((t) => t.status === 'in-progress'),
    done: filteredTasks.filter((t) => t.status === 'done'),
  }

  return (
    <>
      {/* Header with proper spacing */}
      <div className="space-y-6 mb-8">
        <div>
          <Heading level="h1" responsive>
            Tasks
          </Heading>
          <Text muted>
            Manage your tasks efficiently with our powerful task manager
          </Text>
        </div>

        {/* Actions bar with consistent spacing */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ButtonGroup>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </ButtonGroup>
        </div>

        {/* Filters section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <TaskFilters />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Kanban Board with proper grid spacing */}
      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(tasksByStatus).map(([status, tasks]) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold capitalize">
                {status.replace('-', ' ')}
              </h3>
              <span className="text-sm text-muted-foreground">
                {tasks.length}
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TaskCard task={task} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {tasks.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed rounded-lg">
                  <Text muted size="sm">
                    No tasks
                  </Text>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showForm && <TaskForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </>
  )
}
```

---

## Step 7: Task Card Component

### `src/app/apps/tasks/components/task-card.tsx`

```tsx
import { useState } from 'react'
import { MoreVertical, Calendar, Tag, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/typography'
import { useTasks } from '../providers'
import type { Task } from '../types'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask } = useTasks()
  const [showMenu, setShowMenu] = useState(false)

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }

  const handleStatusChange = () => {
    const nextStatus =
      task.status === 'todo'
        ? 'in-progress'
        : task.status === 'in-progress'
        ? 'done'
        : 'todo'

    updateTask(task.id, {
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      ...(nextStatus === 'done' && {
        completedAt: new Date().toISOString(),
      }),
    })
  }

  return (
    <Card
      spacing="compact"
      className={cn(
        'hover:shadow-md transition-all cursor-pointer',
        task.status === 'done' && 'opacity-60'
      )}
      onClick={handleStatusChange}
    >
      <div className="space-y-3">
        {/* Header with priority badge */}
        <div className="flex items-start justify-between">
          <Badge className={priorityColors[task.priority]} variant="secondary">
            {task.priority}
          </Badge>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Title and description */}
        <div className="space-y-2">
          <h4
            className={cn(
              'font-medium',
              task.status === 'done' && 'line-through'
            )}
          >
            {task.title}
          </h4>
          {task.description && (
            <Text size="sm" muted>
              {task.description}
            </Text>
          )}
        </div>

        {/* Footer with metadata */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          {task.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <span>{task.tags.length}</span>
            </div>
          )}
          {task.status === 'done' && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
        </div>
      </div>
    </Card>
  )
}
```

---

## Step 8: Task Form Component

### `src/app/apps/tasks/components/task-form.tsx`

```tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import { Button, ButtonGroup } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  FormField,
  FormGroup,
  FormSection,
  FormActions,
} from '@/components/ui/form-field'
import { Card } from '@/components/ui/card'
import { Heading } from '@/components/ui/typography'
import { useTasks } from '../providers'
import { motion } from 'framer-motion'

interface TaskFormProps {
  onClose: () => void
  editTask?: Task
}

export function TaskForm({ onClose, editTask }: TaskFormProps) {
  const { addTask, updateTask, activeList } = useTasks()
  const [formData, setFormData] = useState({
    title: editTask?.title || '',
    description: editTask?.description || '',
    priority: editTask?.priority || 'medium',
    dueDate: editTask?.dueDate || '',
    tags: editTask?.tags || [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) return

    if (editTask) {
      updateTask(editTask.id, {
        ...formData,
        updatedAt: new Date().toISOString(),
      })
    } else {
      addTask({
        ...formData,
        status: 'todo',
        listId: activeList || 'default',
      })
    }

    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg"
      >
        <Card spacing="spacious" className="relative">
          <Button
            size="icon-sm"
            variant="ghost"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <form onSubmit={handleSubmit}>
            <FormSection
              title={editTask ? 'Edit Task' : 'New Task'}
              description="Add details about your task"
            >
              <FormGroup>
                <FormField label="Title" required>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Task title"
                    autoFocus
                  />
                </FormField>

                <FormField label="Description">
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Add more details..."
                    rows={3}
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Priority">
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as Task['priority'],
                        })
                      }
                      className="flex h-11 w-full rounded-lg border border-input bg-transparent px-4 py-2.5 text-base"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </FormField>

                  <FormField label="Due Date">
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </FormField>
                </div>
              </FormGroup>

              <FormActions>
                <ButtonGroup>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editTask ? 'Update' : 'Create'} Task
                  </Button>
                </ButtonGroup>
              </FormActions>
            </FormSection>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  )
}
```

---

## Step 9: Register the App

### Update `src/lib/apps/registry.ts`

```typescript
import tasksConfig from '@/app/apps/tasks/config'

// Add to registry
registerApp(tasksConfig)
```

---

## Step 10: Add to Main Apps Page

### Update `src/app/apps/page.tsx`

```typescript
const apps: App[] = [
  {
    id: 'self-help',
    // ... existing self-help config
  },
  {
    id: 'tasks',
    title: 'Task Manager',
    description: 'Organize your work efficiently',
    longDescription: 'A powerful task management system with boards, priorities, and collaborative features.',
    icon: CheckSquare,
    href: '/apps/tasks',
    status: 'live',
    features: [
      'Kanban board view',
      'Priority management',
      'Due date tracking',
      'Tag organization'
    ],
    tech: ['Next.js 15', 'Framer Motion', 'Local Storage', 'TypeScript'],
    gradient: 'from-green-500 to-teal-500',
  }
]
```

---

## Key Implementation Patterns

### 1. **Consistent Spacing Throughout**
- Cards use `spacing="compact"` for task cards (dense information)
- Forms use `spacing="spacious"` for better input accessibility
- Sections use standard `space-y-6` (24px) gaps

### 2. **Proper Touch Targets**
- All buttons use minimum `h-11` (44px)
- Form inputs are `h-11` for consistency
- Icon buttons use `size="icon-sm"` which maintains 44px

### 3. **Responsive Design**
- Grid layouts: `grid gap-6 md:grid-cols-3`
- Flex layouts: `flex flex-col sm:flex-row gap-4`
- Responsive text: Using `Heading` component with `responsive` prop

### 4. **Component Composition**
- Reusing `Card`, `Button`, `FormField` from shared library
- Extending with app-specific components (`TaskCard`)
- Maintaining consistent prop APIs

### 5. **State Management**
- Context provider for app-wide state
- Local storage for persistence
- Type-safe with TypeScript interfaces

### 6. **Animation & Polish**
- Framer Motion for smooth transitions
- Staggered animations for lists
- Modal animations for forms

---

## Testing the Implementation

### 1. Accessibility Check
```bash
# Run accessibility audit
npm run lint
npx lighthouse http://localhost:3000/apps/tasks
```

### 2. TypeScript Check
```bash
# Ensure type safety
npx tsc --noEmit
```

### 3. Responsive Testing
- Test on mobile (375px)
- Test on tablet (768px)
- Test on desktop (1440px)

### 4. Spacing Validation
- Verify all buttons ≥ 44px
- Check consistent gaps (8px multiples)
- Confirm responsive spacing works

---

## Extending Further

### Add More Features
1. **Task Comments** - Add discussion threads
2. **File Attachments** - Upload documents
3. **Recurring Tasks** - Schedule repeating tasks
4. **Team Collaboration** - Share lists with others
5. **Analytics Dashboard** - Track productivity

### Connect to Backend
```typescript
// Replace localStorage with API calls
async function fetchTasks() {
  const response = await fetch('/api/apps/tasks')
  return response.json()
}

// Use React Query or SWR for data fetching
import { useQuery } from '@tanstack/react-query'

function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })
}
```

### Add Real-time Updates
```typescript
// Add WebSocket support
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3000/tasks')

  ws.on('taskUpdated', (task) => {
    updateTask(task.id, task)
  })

  return () => ws.close()
}, [])
```

---

## Summary

This example demonstrates:
- ✅ **Federated architecture** - Self-contained app module
- ✅ **Design system usage** - Consistent spacing and components
- ✅ **Type safety** - Full TypeScript support
- ✅ **Accessibility** - 44px touch targets throughout
- ✅ **Responsive design** - Works on all devices
- ✅ **State management** - Context + localStorage
- ✅ **Animation** - Polished interactions
- ✅ **Modular structure** - Easy to extend

By following this pattern, you can quickly create new federated apps that:
1. Integrate seamlessly with the main application
2. Maintain consistent design standards
3. Share common components and utilities
4. Scale independently
5. Provide excellent user experience

---

*This is a complete, working example. Copy the code and start building!*