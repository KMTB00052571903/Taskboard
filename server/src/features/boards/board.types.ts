export interface Board {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface BoardWithCreator {
  id: string;
  name: string;
  created_at: string;
  created_by: {
    user_name: string;
    email: string;
  };
}

export interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  board_id: string;
  created_by: string;
  created_at: string;
}

export interface TaskWithCreator {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  board_id: string;
  created_at: string;
  created_by: {
    user_name: string;
    email: string;
  };
}

export interface BoardWithTasks extends BoardWithCreator {
  tasks: TaskWithCreator[];
}
