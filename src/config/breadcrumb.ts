export type IconName = 
  | "Home" 
  | "Settings" 
  | "Globe" 
  | "Layout" 
  | "ChevronRight"
  | "Save"
  | "User"
  | "Users"
  | "FileText"
  | "Image"
  | "Folder"
  | "Search"
  | "Plus"
  | "Edit"
  | "Trash2"
  | "Eye"
  | "Download"
  | "Upload"
  | "Calendar"
  | "Clock"
  | "Mail"
  | "Phone"
  | "MapPin"
  | "Star"
  | "Heart"
  | "Share"
  | "Filter"
  | "SortAsc"
  | "SortDesc"
  | "MoreHorizontal"
  | "MoreVertical"
  | "X"
  | "Check"
  | "AlertCircle"
  | "Info"
  | "HelpCircle"
  | "ExternalLink";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: IconName;
}

export interface BreadcrumbConfig {
  items: BreadcrumbItem[];
  title: string;
}