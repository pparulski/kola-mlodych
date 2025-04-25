
import { 
  Home, Map, BookOpen, Download, File, Info, Image, Newspaper, 
  Tag, AirVent, Activity, ArrowDown, ArrowUp, Bell, Calendar, 
  Check, Clock, Cloud, Edit, Folder, Globe, Heart, Link, 
  Lock, LogIn, LogOut, Mail, Menu, MessageSquare, Phone, 
  Search, Settings, Share, Shield, ShoppingCart, Star, 
  Sun, Trash2, User, Users, Video, X, ZoomIn
} from "lucide-react";

/**
 * Get icon component based on icon name
 */
export const getIconComponent = (iconName: string) => {
  // Expanded list of supported icons
  switch (iconName) {
    case 'Home': return Home;
    case 'Map': return Map;
    case 'Download': return Download;
    case 'BookOpen': return BookOpen;
    case 'Book': return BookOpen; // Alias for consistency
    case 'Info': return Info;
    case 'Newspaper': return Newspaper;
    case 'Image': return Image;
    case 'Tag': return Tag;
    case 'AirVent': return AirVent;
    case 'Activity': return Activity;
    case 'ArrowDown': return ArrowDown;
    case 'ArrowUp': return ArrowUp;
    case 'Bell': return Bell;
    case 'Calendar': return Calendar;
    case 'Check': return Check;
    case 'Clock': return Clock;
    case 'Cloud': return Cloud;
    case 'Edit': return Edit;
    case 'Folder': return Folder;
    case 'Globe': return Globe;
    case 'Heart': return Heart;
    case 'Link': return Link;
    case 'Lock': return Lock;
    case 'LogIn': return LogIn;
    case 'LogOut': return LogOut;
    case 'Mail': return Mail;
    case 'Menu': return Menu;
    case 'MessageSquare': return MessageSquare;
    case 'Phone': return Phone;
    case 'Search': return Search;
    case 'Settings': return Settings;
    case 'Share': return Share;
    case 'Shield': return Shield;
    case 'ShoppingCart': return ShoppingCart;
    case 'Star': return Star;
    case 'Sun': return Sun;
    case 'Trash2': return Trash2;
    case 'User': return User;
    case 'Users': return Users;
    case 'Video': return Video;
    case 'X': return X;
    case 'ZoomIn': return ZoomIn;
    // Default icon if none matches
    default: return File;
  }
};
