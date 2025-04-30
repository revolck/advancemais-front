export interface Notification {
  title: string;
  desc: string;
  date: string;
  avatar: string;
  unreadmessage?: boolean;
}

export const notifications: Notification[] = [
  {
    title: 'John Doe',
    desc: 'Sent you a friend request',
    date: '3 hours ago',
    avatar: '/avatar-1.png',
    unreadmessage: true,
  },
  {
    title: 'Jane Smith',
    desc: 'Commented on your post',
    date: '5 hours ago',
    avatar: '/avatar-2.png',
    unreadmessage: true,
  },
  {
    title: 'Team Meeting',
    desc: 'Reminder: Team meeting in 30 minutes',
    date: 'Today, 2:00 PM',
    avatar: '/avatar-3.png',
  },
  {
    title: 'System Update',
    desc: 'Your system has been updated successfully',
    date: 'Yesterday',
    avatar: '/avatar-4.png',
  },
  {
    title: 'New Feature Available',
    desc: 'Check out the new dashboard features',
    date: '2 days ago',
    avatar: '/avatar-5.png',
  },
];

export interface Message {
  title: string;
  desc: string;
  image: string;
  hasnotifaction?: boolean;
}

export const messages: Message[] = [
  {
    title: 'Wade Warren',
    desc: 'Hi! How are you doing?...',
    image: '/avatar-1.png',
    hasnotifaction: true,
  },
  {
    title: 'Savannah Nguyen',
    desc: 'Are we still meeting today?',
    image: '/avatar-2.png',
    hasnotifaction: true,
  },
  {
    title: 'Jacob Jones',
    desc: "I've sent you the files you requested",
    image: '/avatar-3.png',
  },
  {
    title: 'Leslie Alexander',
    desc: 'Thanks for your help yesterday!',
    image: '/avatar-4.png',
  },
  {
    title: 'Courtney Henry',
    desc: "Let's schedule that call we discussed",
    image: '/avatar-5.png',
    hasnotifaction: true,
  },
];
