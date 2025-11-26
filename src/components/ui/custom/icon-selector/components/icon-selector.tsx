"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { InputCustom } from "@/components/ui/custom/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconGrid } from "./icon-grid";
import { POPULAR_ICONS } from "../constants";
import type { IconSelectorProps, IconItem } from "../types";

// Lista expandida de ícones do Lucide (para contornar tree-shaking do Next.js)
// Esta lista contém centenas de ícones comuns do Lucide
// IMPORTANTE: Remover duplicatas usando Set para garantir unicidade
// Calculado uma vez e cacheado
let cachedExpandedIconsList: string[] | null = null;

const getExpandedIconsList = (): string[] => {
  if (cachedExpandedIconsList !== null) {
    return cachedExpandedIconsList;
  }
  
  cachedExpandedIconsList = Array.from(new Set([
    ...POPULAR_ICONS,
  // Adicionar muitos mais ícones do Lucide
  "AArrowDown", "AArrowUp", "ALargeSmall", "Accessibility", "ActivitySquare",
  "AirVent", "AlarmCheck", "AlarmClock", "AlarmClockCheck", "AlarmMinus",
  "AlarmPlus", "Album", "AlertCircle", "AlertOctagon", "AlertTriangle",
  "AlignCenter", "AlignCenterHorizontal", "AlignCenterVertical", "AlignEndHorizontal",
  "AlignEndVertical", "AlignJustify", "AlignLeft", "AlignRight", "AlignStartHorizontal",
  "AlignStartVertical", "Ampersand", "Ampersands", "Anchor", "Angry", "Annoyed",
  "AnnoyedIcon", "Aperture", "AppWindow", "Apple", "ArchiveRestore", "ArchiveX",
  "AreaChart", "Armchair", "ArrowBigDown", "ArrowBigDownDash", "ArrowBigLeft",
  "ArrowBigLeftDash", "ArrowBigRight", "ArrowBigRightDash", "ArrowBigUp",
  "ArrowBigUpDash", "ArrowDown01", "ArrowDown10", "ArrowDownAZ", "ArrowDownFromLine",
  "ArrowDownLeft", "ArrowDownRight", "ArrowDownToDot", "ArrowDownToLine",
  "ArrowDownUp", "ArrowDownWideNarrow", "ArrowDownZA", "ArrowLeftFromLine",
  "ArrowLeftRight", "ArrowLeftToLine", "ArrowRightFromLine", "ArrowRightLeft",
  "ArrowRightToLine", "ArrowUp01", "ArrowUp10", "ArrowUpAZ", "ArrowUpDown",
  "ArrowUpFromDot", "ArrowUpFromLine", "ArrowUpLeft", "ArrowUpRight",
  "ArrowUpToLine", "ArrowUpWideNarrow", "ArrowUpZA", "ArrowsUpFromLine",
  "Asterisk", "AtSign", "Atom", "AudioLines", "AudioWaveform", "Award",
  "Axe", "Axis3d", "Baby", "Backpack", "Badge", "BadgeAlert", "BadgeCheck",
  "BadgeDollarSign", "BadgeHelp", "BadgeInfo", "BadgeMinus", "BadgePercent",
  "BadgePlus", "BadgeX", "BaggageClaim", "Ban", "Banana", "Bandage", "Banknote",
  "BarChart", "BarChart2", "BarChart3", "BarChart4", "Barcode", "Baseline",
  "Bath", "BatteryFull", "BatteryLow", "BatteryMedium", "Beaker", "Bean",
  "BeanOff", "Bed", "BedDouble", "BedSingle", "Beef", "Beer", "BeerOff",
  "BellDot", "BellMinus", "BellOff", "BellPlus", "BellRing", "BetweenHorizontalEnd",
  "BetweenHorizontalStart", "BetweenVertEnd", "BetweenVertStart", "Bike",
  "Binary", "Biohazard", "Bird", "Bitcoin", "Blend", "Blinds", "Blocks",
  "Bluetooth", "BluetoothConnected", "BluetoothOff", "BluetoothSearching",
  "Bold", "Bolt", "Bomb", "Bone", "BookA", "BookAudio", "BookCheck",
  "BookCopy", "BookDashed", "BookDown", "BookHeadphones", "BookHeart",
  "BookImage", "BookKey", "BookLock", "BookMarked", "BookMinus", "BookOpenCheck",
  "BookOpenText", "BookPlus", "BookSearch", "BookType", "BookUp", "BookUp2",
  "BookUser", "BookX", "BookmarkCheck", "BookmarkMinus", "BookmarkPlus",
  "BookmarkX", "BoomBox", "Bot", "BotMessageSquare", "Boxes", "Braces",
  "Brackets", "Brain", "BrainCircuit", "BrickWall", "BriefcaseBusiness",
  "BringToFront", "Brush", "Bug", "BugOff", "Building", "Building2",
  "Bus", "BusFront", "Cable", "CableCar", "Cake", "Calculator", "Calendar1",
  "Calendar2", "CalendarCheck", "CalendarCheck2", "CalendarClock", "CalendarDays",
  "CalendarHeart", "CalendarMinus", "CalendarOff", "CalendarPlus", "CalendarRange",
  "CalendarSearch", "CalendarX", "CalendarX2", "Camera", "CameraOff", "CandlestickChart",
  "Candy", "CandyOff", "Car", "CarFront", "CarTaxiFront", "Caravan", "Carrot",
  "CaseLower", "CaseSensitive", "CaseUpper", "CassetteTape", "Cast", "Castle",
  "Cat", "CheckCheck", "CheckCircle2", "ChefHat", "Cherry", "ChevronsDown",
  "ChevronsDownUp", "ChevronsLeft", "ChevronsLeftRight", "ChevronsRight",
  "ChevronsRightLeft", "ChevronsUp", "ChevronsUpDown", "Chrome", "Church",
  "Cigarette", "CigaretteOff", "CircleAlert", "CircleArrowDown", "CircleArrowLeft",
  "CircleArrowOutDownLeft", "CircleArrowOutDownRight", "CircleArrowOutUpLeft",
  "CircleArrowOutUpRight", "CircleArrowRight", "CircleArrowUp", "CircleCheck",
  "CircleCheckBig", "CircleChevronDown", "CircleChevronLeft", "CircleChevronRight",
  "CircleChevronUp", "CircleDashed", "CircleDivide", "CircleDot", "CircleDotDashed",
  "CircleEllipsis", "CircleEqual", "CircleFadingArrowUp", "CircleFadingPlus",
  "CircleGauge", "CircleHelp", "CircleMinus", "CircleOff", "CircleParking",
  "CircleParkingOff", "CirclePause", "CirclePercent", "CirclePlay", "CirclePlus",
  "CirclePower", "CircleSlash", "CircleSlash2", "CircleStop", "CircleUser",
  "CircleUserRound", "CircleX", "CircuitBoard", "Citrus", "Clapperboard",
  "ClipboardCheck", "ClipboardCopy", "ClipboardEdit", "ClipboardList",
  "ClipboardMinus", "ClipboardPaste", "ClipboardPen", "ClipboardPenLine",
  "ClipboardPlus", "ClipboardType", "ClipboardX", "Clock1", "Clock10", "Clock11",
  "Clock12", "Clock2", "Clock3", "Clock4", "Clock5", "Clock6", "Clock7", "Clock8",
  "Clock9", "ClockAlert", "ClockArrowDown", "ClockArrowUp", "CloudCog", "CloudDrizzle",
  "CloudFog", "CloudHail", "CloudLightning", "CloudMoon", "CloudMoonRain",
  "CloudOff", "CloudRainWind", "CloudSnow", "CloudSun", "CloudSunRain",
  "Cloudy", "Clover", "Club", "Code2", "Coffee", "CoffeeOff", "Cog", "Coins",
  "Columns", "Columns2", "Columns3", "Columns4", "Combine", "Command", "Compass",
  "Component", "Computer", "ConciergeBell", "Cone", "Construction", "Contact",
  "Container", "Contrast", "Cookie", "CopyCheck", "CopyMinus", "CopyPlus",
  "CopySlash", "CopyX", "Copyleft", "Copyright", "CornerDownLeft", "CornerDownRight",
  "CornerLeftDown", "CornerLeftUp", "CornerRightDown", "CornerRightUp",
  "CornerUpLeft", "CornerUpRight", "Cpu", "CreativeCommons", "CreditCard",
  "Croissant", "Crop", "Cross", "Crosshair", "Crown", "CrownOff", "Cuboid",
  "CupSoda", "Currency", "Cylinder", "Dam", "Database", "DatabaseBackup",
  "DatabaseZap", "Delete", "Dessert", "Diameter", "Diamond", "DiamondPercent",
  "Dice1", "Dice2", "Dice3", "Dice4", "Dice5", "Dice6", "Dices", "Diff",
  "Disc", "Disc2", "Disc3", "Dna", "DnaOff", "Dock", "Dog", "DollarSign",
  "Donut", "DoorClosed", "DoorOpen", "Dot", "DownloadCloud", "DraftingCompass",
  "Drama", "Dribbble", "Drill", "Droplet", "Droplets", "Drum", "Drumstick",
  "Dumbbell", "Ear", "EarOff", "Earth", "EarthLock", "Eclipse", "Egg",
  "EggFried", "EggOff", "Equal", "EqualNot", "Eraser", "Ethernet", "Euro",
  "Expand", "ExternalLink", "Eye", "EyeOff", "Facebook", "Factory", "Fan",
  "FastForward", "Feather", "Fence", "FerrisWheel", "Figma", "FileArchive",
  "FileAudio", "FileAudio2", "FileAxis3d", "FileBadge", "FileBadge2",
  "FileBarChart", "FileBarChart2", "FileBox", "FileCheck", "FileCheck2",
  "FileClock", "FileCode", "FileCode2", "FileCog", "FileCog2", "FileDiff",
  "FileDigit", "FileDown", "FileEdit", "FileHeart", "FileImage", "FileInput",
  "FileJson", "FileJson2", "FileKey", "FileKey2", "FileLineChart", "FileLock",
  "FileLock2", "FileMinus", "FileMinus2", "FileMusic", "FileOutput", "FilePen",
  "FilePenLine", "FilePieChart", "FilePlus", "FilePlus2", "FileQuestion",
  "FileScan", "FileSearch", "FileSearch2", "FileSettings", "FileSettings2",
  "FileSliders", "FileSpreadsheet", "FileStack", "FileSymlink", "FileTerminal",
  "FileType", "FileType2", "FileUp", "FileVideo", "FileVideo2", "FileWarning",
  "FileX", "FileX2", "Files", "Film", "Filter", "FilterX", "Fingerprint",
  "FireExtinguisher", "Fish", "FishOff", "Flag", "FlagOff", "FlagTriangleLeft",
  "FlagTriangleRight", "Flame", "FlameKindling", "Flashlight", "FlashlightOff",
  "FlaskConical", "FlaskConicalOff", "FlaskRound", "FlipHorizontal", "FlipHorizontal2",
  "FlipVertical", "FlipVertical2", "Flower", "Flower2", "Focus", "Folders",
  "FoldersArchive", "FoldersCopy", "FoldersDown", "FoldersMinus", "FoldersOpen",
  "FoldersPlus", "FoldersSync", "FoldersUp", "Footprints", "Forklift", "Forward",
  "Frame", "Framer", "Frown", "Fuel", "FunctionSquare", "Gamepad", "Gamepad2",
  "Gauge", "GaugeCircle", "Gavel", "Gem", "Ghost", "Gift", "GitBranch",
  "GitBranchPlus", "GitCommit", "GitCompare", "GitCompareArrows", "GitFork",
  "GitMerge", "GitPullRequest", "GitPullRequestArrow", "GitPullRequestClosed",
  "GitPullRequestCreate", "GitPullRequestCreateArrow", "GitPullRequestDraft",
  "Github", "Gitlab", "GlassWater", "Glasses", "Globe", "GlobeLock", "Goal",
  "Grab", "GraduationCap", "Grape", "Grid", "Grid2x2", "Grid2x2Check",
  "Grid2x2Plus", "Grid2x2X", "Grid3x3", "Grip", "GripHorizontal", "GripVertical",
  "Group", "Hammer", "Hand", "HandCoins", "HandHeart", "HandHelping", "HandMetal",
  "HandPlatter", "Handshake", "HardDrive", "HardDriveDownload", "HardDriveUpload",
  "Hash", "Haze", "HdmiPort", "Heading", "Heading1", "Heading2", "Heading3",
  "Heading4", "Heading5", "Heading6", "Headphones", "Headset", "HeartCrack",
  "HeartHandshake", "HeartOff", "HeartPulse", "Heater", "HelpingHand",
  "Hexagon", "Highlighter", "History", "Home", "Hop", "HopOff", "Hospital",
  "Hotel", "Hourglass", "HousePlug", "HousePlus", "HouseWifi", "IceCream",
  "IceCream2", "IceCreamBowl", "IdCard", "Image", "ImageDown", "ImageMinus",
  "ImageOff", "ImagePlus", "ImageUp", "Images", "Import", "Inbox", "Indent",
  "IndianRupee", "Infinity", "Info", "InspectionPanel", "Instagram", "Italic",
  "IterationCcw", "IterationCw", "JapaneseYen", "Joystick", "Kanban",
  "KanbanSquare", "KanbanSquareDashed", "Key", "KeyRound", "KeySquare",
  "Keyboard", "KeyboardMusic", "Lamp", "LampCeiling", "LampDesk", "LampFloor",
  "LampWallDown", "LampWallUp", "Landmark", "Languages", "Laptop", "LaptopMinimal",
  "Lasso", "LassoSelect", "Laugh", "Layers", "Layers2", "Layers3", "Layout",
  "LayoutDashboard", "LayoutGrid", "LayoutList", "LayoutPanelLeft", "LayoutPanelTop",
  "LayoutTemplate", "Leaf", "LeafOff", "LeafyGreen", "Lectern", "Library",
  "LibraryBig", "LibrarySquare", "LifeBuoy", "Ligature", "Lightbulb", "LightbulbOff",
  "LineChart", "Link", "Link2", "Link2Off", "Linkedin", "List", "ListChecks",
  "ListCollapse", "ListEnd", "ListFilter", "ListMinus", "ListMusic", "ListOrdered",
  "ListPlus", "ListRestart", "ListStart", "ListTodo", "ListTree", "ListVideo",
  "ListX", "Loader", "Loader2", "Locate", "LocateFixed", "LocateOff", "Lock",
  "LockKeyhole", "LockKeyholeOpen", "LockOpen", "LogIn", "LogOut", "Lollipop",
  "Luggage", "Magnet", "Mail", "MailCheck", "MailMinus", "MailOpen", "MailPlus",
  "MailQuestion", "MailSearch", "MailWarning", "MailX", "Mailbox", "Map",
  "MapPin", "MapPinAdd", "MapPinCheck", "MapPinHouse", "MapPinMinus", "MapPinOff",
  "MapPinPlus", "MapPinQuestion", "MapPinSearch", "MapPinX", "MapPinned",
  "Martini", "Maximize", "Maximize2", "Medal", "Megaphone", "MegaphoneOff",
  "Meh", "MemoryStick", "Menu", "Merge", "MessageCircle", "MessageCircleCode",
  "MessageCircleDashed", "MessageCircleHeart", "MessageCircleMore", "MessageCircleOff",
  "MessageCirclePlus", "MessageCircleQuestion", "MessageCircleReply", "MessageCircleWarning",
  "MessageCircleX", "MessageSquare", "MessageSquareCode", "MessageSquareDashed",
  "MessageSquareDiff", "MessageSquareDot", "MessageSquareHeart", "MessageSquareMore",
  "MessageSquareOff", "MessageSquarePlus", "MessageSquareQuote", "MessageSquareReply",
  "MessageSquareShare", "MessageSquareText", "MessageSquareWarning", "MessageSquareX",
  "MessagesSquare", "Mic", "MicOff", "MicVocal", "Microchip", "Microscope",
  "Microwave", "Milestone", "Milk", "MilkOff", "Minimize", "Minimize2", "Minus",
  "Monitor", "MonitorCheck", "MonitorCog", "MonitorDot", "MonitorDown", "MonitorOff",
  "MonitorPause", "MonitorPlay", "MonitorSmartphone", "MonitorSpeaker", "MonitorStop",
  "MonitorUp", "MonitorX", "Moon", "MoonStar", "MoreHorizontal", "MoreVertical",
  "Mountain", "MountainSnow", "Mouse", "MouseOff", "MousePointer", "MousePointer2",
  "MousePointerBan", "MousePointerClick", "Move", "Move3d", "MoveDown", "MoveDownLeft",
  "MoveDownRight", "MoveHorizontal", "MoveLeft", "MoveRight", "MoveUp", "MoveUpDown",
  "MoveUpLeft", "MoveUpRight", "MoveVertical", "Music", "Music2", "Music3", "Music4",
  "Navigation", "Navigation2", "Navigation2Off", "NavigationOff", "Network",
  "Newspaper", "Nfc", "Notebook", "NotebookPen", "NotebookTabs", "NotebookText",
  "NotepadText", "NotepadTextDashed", "Nut", "NutOff", "Octagon", "OctagonAlert",
  "OctagonMinus", "OctagonPause", "OctagonPlus", "OctagonX", "Omega", "Option",
  "Orbit", "OrbitIcon", "Origami", "Package", "Package2", "PackageCheck",
  "PackageMinus", "PackageOpen", "PackagePlus", "PackageSearch", "PackageX",
  "Packages", "Paintbrush", "Paintbrush2", "PaintbrushVertical", "Paintbucket",
  "Palette", "Palmtree", "PanelBottom", "PanelBottomClose", "PanelBottomDashed",
  "PanelBottomOpen", "PanelLeft", "PanelLeftClose", "PanelLeftDashed", "PanelLeftOpen",
  "PanelRight", "PanelRightClose", "PanelRightDashed", "PanelRightOpen", "PanelTop",
  "PanelTopClose", "PanelTopDashed", "PanelTopOpen", "PanelsTopLeft", "Paperclip",
  "Parentheses", "ParkingCircle", "ParkingCircleOff", "ParkingMeter", "ParkingSquare",
  "ParkingSquareOff", "PartyPopper", "Pause", "PawPrint", "PcCase", "Pen",
  "PenLine", "PenOff", "PenTool", "Pencil", "PencilLine", "PencilOff", "PencilRuler",
  "Pentagon", "Percent", "PersonStanding", "Phone", "PhoneCall", "PhoneForwarded",
  "PhoneIncoming", "PhoneMissed", "PhoneOff", "PhoneOutgoing", "Pi", "Piano",
  "Pickaxe", "PictureInPicture", "PictureInPicture2", "PieChart", "PiggyBank",
  "Pilcrow", "PilcrowLeft", "PilcrowRight", "Pill", "PillBottle", "Pin", "PinOff",
  "Pipette", "Pizza", "Plane", "PlaneLanding", "PlaneTakeoff", "Play", "Plug",
  "PlugOff", "PlugZap", "PlugZap2", "Plus", "Pocket", "PocketKnife", "Podcast",
  "Pointer", "PointerOff", "Popcorn", "Popsicle", "PoundSterling", "Power",
  "PowerCircle", "PowerOff", "Presentation", "PresentationChart", "Printer",
  "Projector", "ProjectorChart", "Puzzle", "Pyramid", "QrCode", "Quote",
  "Rabbit", "Radar", "Radial", "Radio", "RadioReceiver", "Radical", "RailSymbol",
  "Rainbow", "Rat", "Ratio", "Receipt", "ReceiptCent", "ReceiptEuro", "ReceiptIndianRupee",
  "ReceiptJapaneseYen", "ReceiptPoundSterling", "ReceiptRussianRuble", "ReceiptSwissFranc",
  "ReceiptText", "RectangleEllipsis", "RectangleHorizontal", "RectangleVertical",
  "Recycle", "Redo", "Redo2", "RedoDot", "RefreshCcw", "RefreshCw", "Refrigerator",
  "Regex", "RemoveFormatting", "Repeat", "Repeat1", "Repeat2", "Replace", "ReplaceAll",
  "Reply", "ReplyAll", "Rewind", "Ribbon", "Rocket", "RockingChair", "RollerCoaster",
  "Rotate3d", "RotateCcw", "RotateCw", "Route", "RouteOff", "Router", "Rows",
  "Rows2", "Rows3", "Rows4", "Rss", "Ruler", "RussianRuble", "Sailboat", "Salad",
  "Sandwich", "Satellite", "SatelliteDish", "Save", "SaveAll", "Scale", "Scale3d",
  "Scan", "ScanBarcode", "ScanEye", "ScanFace", "ScanHeart", "ScanLine", "ScanQrCode",
  "ScanSearch", "ScanText", "ScatterChart", "School", "School2", "Scissors",
  "ScissorsLineDashed", "ScreenShare", "ScreenShareOff", "Scroll", "ScrollText",
  "Search", "SearchCheck", "SearchCode", "SearchSlash", "SearchX", "Section",
  "Send", "SendHorizontal", "SendToBack", "Separator", "SeparatorHorizontal",
  "SeparatorVertical", "Server", "ServerCog", "ServerCrash", "ServerOff",
  "Settings", "Settings2", "Shapes", "Share", "Share2", "Sheet", "Shell",
  "Shield", "ShieldAlert", "ShieldBan", "ShieldCheck", "ShieldCheckered",
  "ShieldChevron", "ShieldEllipsis", "ShieldHalf", "ShieldMinus", "ShieldOff",
  "ShieldPlus", "ShieldQuestion", "ShieldX", "Ship", "ShipWheel", "Shirt",
  "ShoppingBag", "ShoppingBasket", "ShoppingCart", "Shovel", "ShowerHead",
  "Shrink", "Shrub", "Shuffle", "Sidebar", "SidebarClose", "SidebarOpen",
  "Sigma", "Signal", "SignalHigh", "SignalLow", "SignalMedium", "SignalZero",
  "Signpost", "SignpostBig", "Siren", "SkipBack", "SkipForward", "Skull",
  "Slack", "Slash", "Slice", "Sliders", "SlidersHorizontal", "Smartphone",
  "SmartphoneCharging", "SmartphoneNfc", "Smile", "SmilePlus", "Snail",
  "Snowflake", "Sofa", "Soup", "Space", "Spade", "Sparkle", "Sparkles",
  "Speaker", "Speech", "SpellCheck", "SpellCheck2", "Spline", "Split",
  "Spray", "Sprout", "Square", "SquareActivity", "SquareArrowDown", "SquareArrowDownLeft",
  "SquareArrowDownRight", "SquareArrowLeft", "SquareArrowOutDownLeft",
  "SquareArrowOutDownRight", "SquareArrowOutUpLeft", "SquareArrowOutUpRight",
  "SquareArrowRight", "SquareArrowUp", "SquareArrowUpLeft", "SquareArrowUpRight",
  "SquareAsterisk", "SquareBottomDashedScissors", "SquareCheck", "SquareCheckBig",
  "SquareChevronDown", "SquareChevronLeft", "SquareChevronRight", "SquareChevronUp",
  "SquareCode", "SquareDashed", "SquareDashedBottom", "SquareDashedBottomCode",
  "SquareDashedKanban", "SquareDashedMousePointer", "SquareDivide", "SquareDot",
  "SquareEqual", "SquareFunction", "SquareGanttChart", "SquareKanban", "SquareLibrary",
  "SquareM", "SquareMenu", "SquareMinus", "SquareMousePointer", "SquareParking",
  "SquareParkingOff", "SquarePen", "SquarePercent", "SquarePi", "SquarePilcrow",
  "SquarePlay", "SquarePlus", "SquareRadical", "SquareScissors", "SquareSigma",
  "SquareSlash", "SquareSplitHorizontal", "SquareSplitVertical", "SquareStack",
  "SquareTerminal", "SquareUser", "SquareUserRound", "SquareX", "Squircle",
  "Squirrel", "Stamp", "Star", "StarHalf", "StarOff", "Stars", "StepBack",
  "StepForward", "Stethoscope", "Sticker", "StickyNote", "Store", "StretchHorizontal",
  "StretchVertical", "Strikethrough", "Subscript", "Subtitles", "Sun", "SunDim",
  "SunMedium", "SunMoon", "SunSnow", "Sunrise", "Sunset", "Superscript",
  "SwissFranc", "SwitchCamera", "Sword", "Swords", "Syringe", "Table", "Table2",
  "TableCellsMerge", "TableCellsSplit", "TableColumnsSplit", "TableOfContents",
  "TableProperties", "TableRowsSplit", "Tablet", "Tablets", "Tag", "Tags",
  "Tally1", "Tally2", "Tally3", "Tally4", "Tally5", "Tangent", "Target",
  "Telescope", "Tent", "TentTree", "Terminal", "TerminalSquare", "TestTube",
  "TestTube2", "TestTubes", "Text", "TextCursor", "TextCursorInput", "TextQuote",
  "TextSearch", "TextSelect", "Theater", "Thermometer", "ThermometerSnowflake",
  "ThermometerSun", "ThumbsDown", "ThumbsUp", "Ticket", "TicketCheck", "TicketMinus",
  "TicketPercent", "TicketPlus", "TicketSlash", "TicketX", "Tickets", "TicketsPlane",
  "Timer", "TimerOff", "TimerReset", "ToggleLeft", "ToggleRight", "Toilet",
  "Tornado", "Torus", "Touchpad", "TouchpadOff", "TowerControl", "ToyBrick",
  "Tractor", "TrafficCone", "Train", "TrainFront", "TrainFrontTunnel", "TrainTrack",
  "TramFront", "Transform", "Translate", "Trash", "Trash2", "TreeDeciduous",
  "TreePine", "Trees", "Trello", "TrendingDown", "TrendingUp", "Triangle",
  "TriangleAlert", "TriangleRight", "Trophy", "Truck", "Turtle", "Tv", "TvMinimal",
  "TvMinimalPlay", "Twitch", "Twitter", "Type", "Umbrella", "UmbrellaOff",
  "Underline", "Undo", "Undo2", "UndoDot", "UnfoldHorizontal", "UnfoldVertical",
  "Ungroup", "University", "Unlink", "Unlink2", "Unplug", "Upload", "UploadCloud",
  "Usb", "User", "UserCheck", "UserCog", "UserMinus", "UserPlus", "UserRound",
  "UserRoundCheck", "UserRoundCog", "UserRoundMinus", "UserRoundPlus", "UserRoundSearch",
  "UserRoundX", "UserSearch", "UserX", "Users", "UsersRound", "Utensils",
  "UtensilsCrossed", "UtilityPole", "Variable", "Vault", "Vegan", "VenetianMask",
  "Vibrate", "VibrateOff", "Video", "VideoOff", "Videotape", "View", "Voicemail",
  "Volume", "Volume1", "Volume2", "VolumeX", "Vote", "Wallet", "WalletCards",
  "Wallpaper", "Wand", "Wand2", "Warehouse", "WashingMachine", "Watch", "Waves",
  "Waypoints", "Webcam", "Webhook", "WebhookOff", "Weight", "Wheat", "WheatOff",
  "WholeWord", "Wifi", "WifiOff", "Wind", "WindArrowDown", "Wine", "WineOff",
  "Workflow", "Worm", "Wrench", "X", "XCircle", "XOctagon", "XSquare", "Youtube",
  "Zap", "ZapOff", "ZoomIn", "ZoomOut"
  ])) as string[];
  
  return cachedExpandedIconsList;
};

// Cache global para a lista de ícones (calculado uma vez)
let cachedIconList: string[] | null = null;

// Função auxiliar para verificar se um valor é um componente React válido
const isReactComponent = (value: any): boolean => {
  if (!value) return false;
  if (typeof value === "function") return true;
  if (typeof value === "object") {
    if (value.$$typeof) return true;
    if (typeof value.render === "function") return true;
  }
  return false;
};

// Obter todos os ícones do Lucide dinamicamente (com cache)
const getAllLucideIcons = (): string[] => {
  // Retornar cache se já foi calculado
  if (cachedIconList !== null) {
    return cachedIconList;
  }
  
  const iconNames: string[] = [];
  const seenIcons = new Set<string>();
  
  try {
    const keysFromKeys = Object.keys(LucideIcons);
    const keysFromNames = Object.getOwnPropertyNames(LucideIcons);
    const allKeys = Array.from(new Set([...keysFromKeys, ...keysFromNames]));
    
    for (const key of allKeys) {
      if (key[0] !== key[0].toUpperCase()) continue;
      
      if (
        key === "Icon" ||
        key === "LucideIcon" ||
        key === "IconProps" ||
        key === "IconNode" ||
        key === "default" ||
        key.startsWith("create")
      ) {
        continue;
      }
      
      const icon = (LucideIcons as any)[key];
      
      if (isReactComponent(icon)) {
        const baseName = key.endsWith("Icon") ? key.slice(0, -4) : key;
        
        if (!seenIcons.has(baseName)) {
          seenIcons.add(baseName);
          iconNames.push(baseName);
        } else if (!key.endsWith("Icon")) {
          const index = iconNames.indexOf(baseName);
          if (index !== -1) {
            iconNames[index] = baseName;
          }
        }
      }
    }
    
    // Ordenar e cachear
    cachedIconList = iconNames.sort();
    return cachedIconList;
  } catch (error) {
    console.error("❌ Erro ao obter ícones do Lucide:", error);
    cachedIconList = [];
    return [];
  }
};

export function IconSelector({
  value,
  onValueChange,
  placeholder = "Selecione um ícone",
  className,
  disabled = false,
  label,
  required = false,
}: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>();

  // Obter todos os ícones do Lucide (calculado uma vez, com cache global)
  const allLucideIcons = useMemo(() => {
    const dynamicIcons = getAllLucideIcons();
    return dynamicIcons.length > 100 ? dynamicIcons : getExpandedIconsList();
  }, []);

  // Validar se o ícone existe na lista
  const selectedIconName = useMemo(() => {
    if (!value) return null;
    const iconExists = allLucideIcons.includes(value);
    return iconExists ? value : null;
  }, [value, allLucideIcons]);

  // Obter o componente do ícone selecionado
  // Tentar primeiro o nome direto, depois com "Icon" no final
  const SelectedIcon = selectedIconName
    ? ((LucideIcons as any)[selectedIconName] ||
        (LucideIcons as any)[`${selectedIconName}Icon`]) as LucideIcon
    : null;

  // Capturar largura do trigger dinamicamente
  useEffect(() => {
    if (!triggerRef.current) return;

    const updateWidth = () => {
      setTriggerWidth(triggerRef.current?.offsetWidth);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(triggerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Filtrar apenas os nomes dos ícones (sem criar componentes ainda)
  const filteredIconNames = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) {
      return allLucideIcons;
    }
    return allLucideIcons.filter((iconName) =>
          iconName.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, allLucideIcons]);

  // Estado para controlar quantos ícones renderizar (renderização progressiva)
  const [visibleIconsCount, setVisibleIconsCount] = useState(50); // Começar com 50 ícones (mais rápido)

  // Resetar contador quando abrir ou quando a busca mudar
  useEffect(() => {
    if (open) {
      setVisibleIconsCount(50); // Resetar para 50 quando abrir (renderização inicial rápida)
    }
  }, [open, searchTerm]);

  // Criar componentes apenas quando o popover estiver aberto (lazy loading)
  // E apenas para os ícones visíveis (renderização progressiva)
  const filteredIcons = useMemo((): IconItem[] => {
    if (!open) {
      return []; // Não processar se o popover estiver fechado
    }

    // Limitar aos ícones visíveis
    const iconsToProcess = filteredIconNames.slice(0, visibleIconsCount);
    const iconMap = new Map<string, LucideIcon>();

    for (const iconName of iconsToProcess) {
      const IconComponent =
        ((LucideIcons as any)[iconName] ||
          (LucideIcons as any)[`${iconName}Icon`]) as LucideIcon;
      
      if (IconComponent) {
        iconMap.set(iconName, IconComponent);
      }
    }

    return Array.from(iconMap.entries()).map(([name, component]) => ({
      name,
      component,
    }));
  }, [open, filteredIconNames, visibleIconsCount]);

  // Função para carregar mais ícones quando o usuário scrollar
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    
    // Quando estiver próximo do final (80% scrollado), carregar mais
    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      const remaining = filteredIconNames.length - visibleIconsCount;
      if (remaining > 0) {
        // Carregar mais 50 ícones ou o restante, o que for menor
        setVisibleIconsCount((prev) => Math.min(prev + 50, filteredIconNames.length));
      }
    }
  }, [filteredIconNames.length, visibleIconsCount]);

  // Handler para seleção de ícone
  const handleSelect = useCallback(
    (iconName: string) => {
      onValueChange(iconName);
      setOpen(false);
      setSearchTerm("");
    },
    [onValueChange]
  );

  // Handler para limpar busca
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Handler para mudança de estado do popover
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchTerm("");
    }
  }, []);

  // Limpar busca quando fechar
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  return (
    <div className="w-full">
      {/* Label posicionado acima do selector */}
      {label && (
        <Label
          className={cn(
            "block text-sm font-medium text-gray-700 mb-2",
            required && "required"
          )}
        >
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={
              selectedIconName
                ? `Ícone selecionado: ${selectedIconName}`
                : placeholder
            }
            disabled={disabled}
            className={cn(
              "w-full justify-between h-11 px-3 text-left font-normal",
              "border-gray-200 hover:border-gray-300 bg-transparent",
              "focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors duration-200",
              className
            )}
          >
            <div className="flex items-center gap-2 flex-1 overflow-hidden">
              {SelectedIcon ? (
                <>
                  <SelectedIcon className="h-4 w-4 text-gray-600 shrink-0" />
                  <span className="text-gray-900 truncate">
                    {selectedIconName}
                  </span>
                </>
              ) : (
                <span className="text-gray-500 truncate">{placeholder}</span>
              )}
            </div>
            <ChevronDown
              className={cn(
                "ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 rounded-lg border border-gray-200 shadow-lg z-[9999]"
          style={{ width: triggerWidth || "auto" }}
          align="start"
          sideOffset={5}
        >
          {/* Header com busca */}
          <div className="p-2 border-b border-gray-100">
            <InputCustom
              label=""
              placeholder="Buscar ícones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
              rightIcon={searchTerm ? "X" : undefined}
              onRightIconClick={searchTerm ? handleClearSearch : undefined}
              size="sm"
              className="w-full"
              autoFocus
            />
          </div>

          {/* Grid de ícones */}
          <div
            className="h-[280px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            onScroll={handleScroll}
            onWheel={(e) => {
              e.stopPropagation();
              const target = e.currentTarget;
              target.scrollTop += e.deltaY;
            }}
          >
            <div className="p-2">
              {filteredIcons.length > 0 ? (
                <IconGrid
                  icons={filteredIcons}
                  selectedIcon={selectedIconName || ""}
                  onSelect={handleSelect}
                />
              ) : (
                <EmptyState searchTerm={searchTerm} />
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Componente para estado vazio
function EmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8 px-4">
      {searchTerm && (
        <p className="text-xs mt-1 text-gray-500 text-center">
          Não encontramos ícones para "{searchTerm}"
        </p>
      )}
    </div>
  );
}
