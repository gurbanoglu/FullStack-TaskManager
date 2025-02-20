import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { BsPencilSquare } from "react-icons/bs";
import { IoCheckmark } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import { createTask } from './createTask';
import { getTasks } from './getTasks';
import { updateTask } from './updateTask';
import { markTaskComplete } from './markTaskComplete';
import { deleteTask } from './deleteTask';
import styled from "styled-components";
import {
  useMutation, useQuery, useQueryClient
} from '@tanstack/react-query';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';

export type Task = {
  id: string
  title: string
  description: string
  dueDate: string
  isComplete: number
};

export type newTask = Omit<Task, 'id'>;

const StyledDiv = styled.div<{
  $task: Task
}>`
  display: flex;
  flex-direction: row;
  margin-bottom: 0.75rem;
  justify-content: ${ props =>
    props.$task !== null ? 'center' : 'space-between'
  };

  button {
    margin-top: 1rem;
  }
`;

const StyledParagraph = styled.p<{
  $task: Task
}>`
  text-decoration: ${ props =>
    props.$task.isComplete ? 'line-through' : 'none'
  };
`;

const AddTaskForm = (
  {
    task,
    onSubmit
  } : {
    /* "task" is an optional parameter
       to the AddTaskForm component. */
    task?: Task,
    onSubmit: SubmitHandler<Task>
  }
) => {
  // const [dueDate, setDueDate] = useState(new Date());
  const [dueDate, setDueDate] = useState<Dayjs | null>(dayjs(new Date()));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<Task>({
    /* If "defaultValues" is truthy, assign
       it to the defaultValues attribute. */
    defaultValues: task ? {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate
    } : {
      title: '',
      description: '',
      dueDate: ''
    }
  });

  const handleClick: SubmitHandler<Task> = (inputtedData: Task) => {
    // If a new task is being created.
    if(task === undefined) {
      reset();
    }

    console.log('inputtedData:', inputtedData);

    /* onSubmit will either be assigned
       onCreateSubmit or onEditSubmit. */
    onSubmit(inputtedData);
  };

  return (
    /* "handleSubmit" will validate the
       inputs before invoking "onSubmit". */
    <form onSubmit={handleSubmit(handleClick)}>
      <label>Task Title</label>

      {/* Register the input into the hook by
          invoking the "register" function. */}
      <input
        {...register(
          'title', 
          { required: 'You must input a title for the task.' })}
        type='text'
        placeholder='Enter a task title...' />

      {errors.title && <p role="alert">{errors.title.message}</p>}

      <label>Task Description</label>
      <textarea {...register('description', 
        { required: 'You must input a description for the task.' })}
        maxLength={500} rows={8}
        placeholder="Enter the task description..." />

      {errors.description && <p role="alert">{errors.description.message}</p>}

      <label>Due Date</label>

      <div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            {...register('dueDate', 
              { required: 'You must input a due date for the task.' })}
            value={dueDate}
            closeOnSelect={false}
            onChange={(date) => setDueDate(date!)}
            minDateTime={dayjs().set('hour', new Date().getHours()).startOf('hour')
              .set('minute', new Date().getMinutes()).startOf('minute')}
            sx={{ width: 1 }}
          />
        </LocalizationProvider>
      </div>

      {errors.dueDate && <p role="alert">{errors.dueDate.message}</p>}

      <div className="center">
        {task !== null ?
          <StyledDiv $task={task!}>
            <button
              type='submit'>
              <BsPencilSquare />
              Save Task
            </button>
          </StyledDiv>
          :
          <button type="submit">Add Task</button>
        }
      </div>
    </form>
  );
};

export const TaskComponent = () => {
  const [idOfTaskToEdit, setIdOfTaskToEdit] = useState('-1');

  const { isPending, isSuccess, isError, data, error } = useQuery({
    queryKey: ['task-component'],
    queryFn: getTasks
  })

  if (isPending) {
    console.log('Pending...');
  }

  if(isSuccess) {
    console.log('The query was successful and data is available.');
    console.log(`data?.tasks: ${JSON.stringify(data?.tasks, null, 2)}`);
  }

  if (isError) {
    console.log(`Error: ${error.message}`);
  }

  // Access the client
  const queryClient = useQueryClient();
  
  const addTask = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate and refetch
      /*Invalidating queries is performed
        rather than setting state.*/
      queryClient.invalidateQueries({ queryKey: ['task-component'] })
    },
    onError: () => {
      console.log("Error occured while invoking mutation.")
    }
  });

  // PATCH (partial update)
  const markAsComplete = useMutation({
    mutationFn: markTaskComplete,
    onSuccess: () => {
      // Invalidate and refetch
      /*Invalidating queries is performed
        rather than setting state.*/
      queryClient.invalidateQueries({ queryKey: ['task-component'] })
    },
    onError: () => {
      console.log("Error occured while invoking mutation.")
    }
  });

  // PUT
  const saveEdit = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      // Invalidate and refetch
      /*Invalidating queries is performed
        rather than setting state.*/
      queryClient.invalidateQueries({ queryKey: ['task-component'] })
    },
    onError: () => {
      console.log("Error occured while invoking mutation.")
    }
  });

  const removeTask = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-component'] })
    },
    onError: () => {
      console.log("Error occured while invoking mutation.")
    }
  });

  const onCreateSubmit = (inputtedData: Task) => {
    addTask.mutate(
      {
        title: inputtedData.title,
        description: inputtedData.description,
        dueDate: inputtedData.dueDate,
        isComplete: 0
      }
    )
  };

  const onEditSubmit: SubmitHandler<Task> = (inputtedData: Task) => {
    saveEdit.mutate(
      {
        id: inputtedData.id,
        title: inputtedData.title,
        description: inputtedData.description,
        dueDate: inputtedData.dueDate,
        isComplete: 0
      }
    );
    setIdOfTaskToEdit('-1');
  };

  return (
    <div className="row">
      <div className="task-input-col">
        <div className="control-wrapper">
          <h1>Task Manager</h1>
          <AddTaskForm
            onSubmit={onCreateSubmit}
          />
        </div>
      </div>

      {data?.tasks.length > 0 &&
        <div className="task-list-section">
          <div className="control-wrapper">
            <h1>Tasks</h1>

            <ul>
              {data?.tasks.map((task: Task) => {
                return idOfTaskToEdit === task.id ?
                  <li key={task.id}>
                    <div className="task-item-row">
                      <div className="column">
                        <AddTaskForm
                          task={task}
                          onSubmit={onEditSubmit}/>
                      </div>
                    </div>
                  </li>
                  :
                  <li key={task.id}>
                    <div className="task-item-row">
                      <div className="column">
                        <div className="task-item-row">
                          <StyledParagraph $task={task}>{task.title}</StyledParagraph>
                        </div>
                        <div className="task-item-row">
                          <StyledParagraph $task={task}>Due date: {task.dueDate}</StyledParagraph>
                        </div>
                        <div className="task-item-row">
                          <StyledParagraph $task={task}>{task.description}</StyledParagraph>
                        </div>
                      </div>
                    </div>

                    <div className="task-buttons">
                      <button className="task-complete-btn"
                        onClick={() => markAsComplete.mutate(task.id)}>
                        <IoCheckmark />
                        {task.isComplete ? 'Mark as Incomplete' : 'Mark as Complete'}
                      </button>

                      <button className="task-edit-btn"
                        onClick={() => setIdOfTaskToEdit(task.id)}
                      >
                        <BsPencilSquare />
                        Edit
                      </button>

                      <button className="task-delete-btn"
                        onClick={() => removeTask.mutate(task.id)}>
                        <MdDeleteOutline />
                        Delete
                      </button>
                    </div>
                  </li>
                }
              )}
            </ul>
          </div>
        </div>
      }
    </div>
  );
};

export default TaskComponent;