export interface User {
  id: string;
  username: string;
  password: string;
  permissions: {
    add: boolean;
    edit: boolean;
    delete: boolean;
    changeStatus: boolean;
    manageCategories: boolean;
    manageUsers: boolean;
  };
}

export interface LoginFormData {
  username: string;
  password: string;
}