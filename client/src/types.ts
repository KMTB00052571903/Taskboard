export interface User {
  id: string;
  email: string;
  user_name: string;
}

export interface UserWithToken {
  user: User;
  token: string;
}

export interface Creator {
  user_name: string;
  email: string;
}

export interface Board {
  id: string;
  name: string;
  created_at: string;
  created_by: Creator;
}

export interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  board_id: string;
  created_at: string;
  created_by: Creator;
}

export interface BoardWithTasks extends Board {
  tasks: Task[];
}
