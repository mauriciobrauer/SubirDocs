export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  dropboxPath: string;
  shareUrl: string;
  downloadUrl: string;
}

export interface DropboxFile {
  name: string;
  path_lower: string;
  size: number;
  client_modified: string;
  server_modified: string;
}

export interface DropboxShareLink {
  url: string;
  name: string;
  path_lower: string;
  link_permissions: {
    can_revoke: boolean;
    visibility: string;
  };
}
