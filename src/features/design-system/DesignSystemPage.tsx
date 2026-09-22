import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker, DateRangePicker, MonthPicker, YearPicker, DateTimePicker } from "@/components/ui/date-picker";
import { Select, MultiSelect } from "@/components/ui/select";
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Sparkles,
  Plus,
  Trash2,
  Users,
  Wrench,
  Calendar,
  Search,
  Mail,
} from "lucide-react";

import {
  ConfirmDialog,
  DeleteModal,
  FileActions,
  FormModal,
  ModalWrapper,
  TableRowActions,
} from "@/components/common";
import { DataTable } from "@/components/common/DataTable";
import { FormField } from "@/components/common/FormField";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FileUploadZone } from "@/components/common/FileUploadZone";
import { MotionPage } from "@/components/common/MotionWrapper";
import { RoleLayout } from "@/layouts";
import type { NavItem } from "@/types/navigation";
import { Icon, Icons } from "@/components/icons";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import { useGetEmailTemplatePreviewsQuery } from "./api/emailTemplatesApi";

const SAMPLE_NAV_ITEMS: NavItem[] = [
  { key: "overview", label: "Overview", icon: Sparkles },
  { key: "service_requests", label: "Service Requests", icon: Wrench },
  {
    key: "socials",
    label: "Socials",
    icon: Users,
    subItems: [
      { key: "announcements", label: "Announcements" },
      { key: "events", label: "Events" },
    ],
  },
  { key: "meetings", label: "Meetings", icon: Calendar },
];

const SAMPLE_TABLE_DATA = [
  { id: "1", title: "Pool Maintenance Notice", category: "Maintenance", status: "Active", author: "Admin", date: "2026-08-25" },
  { id: "2", title: "Annual General Meeting", category: "General", status: "Pending", author: "Board", date: "2026-08-28" },
  { id: "3", title: "Emergency Water Shutoff", category: "Urgent", status: "Resolved", author: "Admin", date: "2026-08-20" },
  { id: "4", title: "Community Festival", category: "Celebration", status: "Active", author: "Social Comm.", date: "2026-09-05" },
];

export const DesignSystemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("inputs");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isCustomFormOpen, setCustomFormOpen] = useState(false);
  const [isNonFormOpen, setNonFormOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isConfirmWarningOpen, setConfirmWarningOpen] = useState(false);
  const [isConfirmSuccessOpen, setConfirmSuccessOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);
  const [isDeletingDemo, setIsDeletingDemo] = useState(false);
  const [radioVal, setRadioVal] = useState("option1");
  const [switchVal, setSwitchVal] = useState(true);
  const [uploadedFile, setUploadedFile] = useState("");

  // Interactive state for Inputs preview
  const [communityName, setCommunityName] = useState("Whispering Palms HOA");
  const [searchQuery, setSearchQuery] = useState("");
  const [liveNumStr, setLiveNumStr] = useState("0.25");
  const [liveNumVal, setLiveNumVal] = useState<number | undefined>(0.25);
  const [duesAmount, setDuesAmount] = useState<number | undefined>(5500);
  const [liveTextarea, setLiveTextarea] = useState("Please ensure the clubhouse swimming pool filter is checked prior to the weekend community event.");
  
  // Interactive state for Date Pickers preview
  const [singleDate, setSingleDate] = useState("2026-09-05");
  const [dateTimeVal, setDateTimeVal] = useState("2026-09-12T18:30");
  const [monthVal, setMonthVal] = useState("2026-09");
  const [yearVal, setYearVal] = useState("2026");
  const [dateRangeVal, setDateRangeVal] = useState<{ from: string; to: string }>({
    from: "2026-09-01",
    to: "2026-09-15",
  });

  // Interactive state for Checkboxes
  const [pinnedChecked, setPinnedChecked] = useState(true);
  const [termsChecked, setTermsChecked] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(["pool", "gym"]);

  // Interactive state for Radios
  const [billingPlan, setBillingPlan] = useState("annual");
  const [notificationChannel, setNotificationChannel] = useState("push_email");

  // Interactive state for Switches (Toggles)
  const [autoBilling, setAutoBilling] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  // Interactive state for Select & MultiSelect
  const [selectedRole, setSelectedRole] = useState("admin");
  const [selectedEntity, setSelectedEntity] = useState("azure");
  const [selectedTier, setSelectedTier] = useState("gold");
  const [selectedTags, setSelectedTags] = useState<string[]>(["maintenance", "board", "urgent"]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(["1", "3"]);
  const {
    data: emailTemplates,
    error: emailTemplatesError,
    isLoading: isLoadingEmailTemplates,
  } =
    useGetEmailTemplatePreviewsQuery();

  return (
    <TooltipProvider>
      <RoleLayout
        title="Design System & UI Primitives"
        description="Nestora architectural foundation with smooth hardware-accelerated animations and centralized icons."
        activeTab={activeTab}
        onTabChange={setActiveTab}
        headerControls={
          <div className="flex items-center gap-2">
            <Button variant="default" onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Open Modal
            </Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              <Trash2 size={16} /> Delete Action
            </Button>
          </div>
        }
      >
        <Tabs defaultValue="inputs">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="inputs">Form Controls &amp; Pickers</TabsTrigger>
            <TabsTrigger value="primitives">Atomic Primitives</TabsTrigger>
            <TabsTrigger value="icons">Centralized Icons</TabsTrigger>
            <TabsTrigger value="forms">Form Fields</TabsTrigger>
            <TabsTrigger value="table">Data Table</TabsTrigger>
            <TabsTrigger value="table-actions">Table Actions</TabsTrigger>
            <TabsTrigger value="feedback">Feedback & States</TabsTrigger>
            <TabsTrigger value="emails">Email Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="emails">
            <MotionPage className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Transactional email templates</h3>
                <p className="text-sm text-slate-500 mt-1">
                  These previews are rendered by the same server templates used for real email delivery.
                </p>
              </div>

              {isLoadingEmailTemplates && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
                  Loading email templates…
                </div>
              )}

              {emailTemplatesError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  <p className="font-semibold">Email templates could not be loaded.</p>
                  <p className="mt-1">
                    {formatApiErrorDetail((emailTemplatesError as { data?: unknown }).data) ||
                      "Restart the backend and confirm /api/admin/associations/email-templates is available."}
                  </p>
                </div>
              )}

              {emailTemplates && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                  {[
                    ["registration", "Registration code"],
                    ["password_reset", "Password reset link"],
                    ["password_reset_otp", "Password reset verification code"],
                  ].map(([key, label]) => {
                    const template = emailTemplates[key as keyof typeof emailTemplates];
                    return (
                      <section key={key} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                          <p className="text-xs uppercase tracking-wider font-bold text-slate-500">{label}</p>
                          <h4 className="text-sm font-semibold text-slate-800 mt-1">{template.subject}</h4>
                        </div>
                        <iframe
                          title={`${label} preview`}
                          srcDoc={template.html}
                          className="w-full h-[720px] bg-[#f9f8f6]"
                          sandbox=""
                        />
                      </section>
                    );
                  })}
                </div>
              )}
            </MotionPage>
          </TabsContent>

          {/* TAB 1: ATOMIC PRIMITIVES */}
          <TabsContent value="primitives">
            <MotionPage className="space-y-8">
              {/* Buttons */}
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-3">Buttons</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="default">Default (Slate 800)</Button>
                  <Button variant="primary">Primary (Blue 600)</Button>
                  <Button variant="moss">Moss Accent</Button>
                  <Button variant="clay">Clay Accent</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="primary" isLoading>Loading</Button>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-3">Buttons</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="default">Default (Slate 800)</Button>
                  <Button variant="primary">Primary (Blue 600)</Button>
                  <Button variant="moss">Moss Accent</Button>
                  <Button variant="clay">Clay Accent</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="primary" isLoading>Loading</Button>
                </div>
              </div>

              {/* Badges */}
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-3">Nestora Category & Status Badges</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="moss">General</Badge>
                  <Badge variant="maintenance">Maintenance</Badge>
                  <Badge variant="clay">Urgent</Badge>
                  <Badge variant="celebration">Celebration</Badge>
                  <StatusBadge status="Active" />
                  <StatusBadge status="Pending" />
                  <StatusBadge status="Resolved" />
                  <StatusBadge status="Expired" />
                </div>
              </div>

              {/* Avatars */}
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-3">Avatars</h3>
                <div className="flex items-center gap-3">
                  <Avatar size="sm" fallbackText="Sarah Jenkins" />
                  <Avatar size="md" fallbackText="Admin User" />
                  <Avatar size="lg" fallbackText="Nestora Staff" />
                  <Avatar size="xl" fallbackText="Super Admin" />
                </div>
              </div>
            </MotionPage>
          </TabsContent>

          <TabsContent value="table-actions">
            <MotionPage className="max-w-4xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  File and Row Actions
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Shared table controls for opening, downloading, viewing, editing, and deleting records.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-800">
                    FileActions
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Open uses sky blue; download uses emerald green.
                  </p>

                  <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Insurance Policy.pdf
                      </p>
                      <p className="text-[11px] text-slate-400">
                        File controls
                      </p>
                    </div>
                    <FileActions fileUrl="https://example.com/document.pdf" />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-800">
                    TableRowActions
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    View, edit, and delete remain separate from file controls.
                  </p>

                  <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Association Document
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Record controls
                      </p>
                    </div>
                    <TableRowActions
                      onView={() => undefined}
                      onEdit={() => undefined}
                      onDelete={() => undefined}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h4 className="text-sm font-bold text-slate-800">
                  Compact table cell preview
                </h4>
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                  <div className="grid grid-cols-[1fr_100px_120px] border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500">
                    <span>Document</span>
                    <span className="text-center">File</span>
                    <span className="text-center">Actions</span>
                  </div>
                  <div className="grid grid-cols-[1fr_100px_120px] items-center px-4 py-2.5 text-xs">
                    <span className="font-medium text-slate-700">
                      Society Registration.pdf
                    </span>
                    <FileActions fileUrl="https://example.com/document.pdf" />
                    <TableRowActions
                      onView={() => undefined}
                      onEdit={() => undefined}
                      onDelete={() => undefined}
                    />
                  </div>
                </div>
              </div>
            </MotionPage>
          </TabsContent>

          {/* TAB 2: CENTRALIZED ICONS */}
          <TabsContent value="icons">
            <MotionPage className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-sm text-slate-600">
                  Icons are centralized in <code className="font-mono text-xs text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">@/components/icons</code>.
                  Use <code className="font-mono text-xs text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">&lt;Icon name=&quot;...&quot; size=&#123;24&#125; color=&quot;...&quot; className=&quot;...&quot; /&gt;</code> or direct component imports like <code className="font-mono text-xs text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">&lt;Icons.Badminton size=&#123;24&#125; /&gt;</code>.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Custom & Specialty Domain Icons</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="p-2.5 bg-moss-soft text-moss rounded-xl">
                      <Icon name="Logo" size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Nestora Logo</span>
                      <span className="text-[10px] text-slate-400 font-mono">name=&quot;Logo&quot;</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <Icon name="Badminton" size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Badminton</span>
                      <span className="text-[10px] text-slate-400 font-mono">name=&quot;Badminton&quot;</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                      <Icon name="Swimming" size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Swimming Pool</span>
                      <span className="text-[10px] text-slate-400 font-mono">name=&quot;Swimming&quot;</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Icon name="Wallet" size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Wallet</span>
                      <span className="text-[10px] text-slate-400 font-mono">name=&quot;Wallet&quot;</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Common Navigation & Action Icons</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {[
                    "Overview", "ServiceRequests", "BoardTasks", "Meetings", "Committees",
                    "Socials", "Amenities", "Documents", "Financials", "Security",
                    "Marketplace", "ShieldCheck", "Building", "Mail", "Clock", "QrCode",
                    "Plus", "Trash", "Edit", "Search", "Upload", "Send"
                  ].map((iconName) => (
                    <div key={iconName} className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-50 transition-colors">
                      <Icon name={iconName as any} size={20} className="text-slate-700" />
                      <span className="text-[11px] text-slate-600 font-medium truncate w-full">{iconName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </MotionPage>
          </TabsContent>

          {/* TAB: INPUTS & NUMBER INPUTS */}
          <TabsContent value="inputs">
            <MotionPage className="space-y-10 max-w-5xl">
              {/* SECTION 1: TEXT INPUT */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">1. Text Input (&lt;Input /&gt;)</h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive text input with auto-linked accessible labels, validation states, icons, prefixes/suffixes, and standalone mode.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Integrated Labels & Validation */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Integrated Labels &amp; Validation</h4>
                    <Input
                      label="Community Legal Name"
                      required
                      placeholder="e.g. Whispering Palms HOA"
                      value={communityName}
                      onChange={(e) => setCommunityName(e.target.value)}
                      helperText="Official registered society or condominium title."
                    />
                    <Input
                      label="Resident Contact Email"
                      required
                      type="email"
                      placeholder="resident@nestora.com"
                      defaultValue="invalid-email-format"
                      error="Please enter a valid email address with an @ domain"
                      leftIcon={<Mail size={15} />}
                    />
                    <Input
                      label="Public Announcement Title"
                      placeholder="Brief headline..."
                      charCount={{ max: 100 }}
                      defaultValue="Pool maintenance scheduled for Sunday"
                    />
                  </div>

                  {/* Card 2: Slots, Addons & Interactive Features */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Icons, Addons &amp; Clear Button</h4>
                    <Input
                      label="Association Portal Subdomain"
                      prefix="https://"
                      suffix=".nestora.com"
                      placeholder="palms"
                    />
                    <Input
                      label="Global Directory Search"
                      placeholder="Search residents, units, tickets..."
                      leftIcon={<Search size={15} />}
                      isClearable
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Input
                      label="Readonly Master Identifier"
                      disabled
                      value="ORG-IND-MH-2026-8892"
                      helperText="System-generated unique immutable tenant key."
                    />
                  </div>
                </div>

                {/* Sizing Scale */}
                <div className="mt-6 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Input Size Scale</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <Input
                      size="sm"
                      label="Small (`size='sm'` / 34px)"
                      placeholder="Compact density..."
                      leftIcon={<Search size={13} />}
                    />
                    <Input
                      size="md"
                      label="Medium / Default (`size='md'` / 40px)"
                      placeholder="Standard form field..."
                      leftIcon={<Search size={15} />}
                    />
                    <Input
                      size="lg"
                      label="Large (`size='lg'` / 44px)"
                      placeholder="Spacious input..."
                      leftIcon={<Search size={17} />}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: NUMBER INPUT */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">2. Number Input (&lt;NumberInput /&gt;)</h3>
                  <p className="text-xs text-slate-500">
                    Strict number-only validation (blocks <code className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-mono">e, E, +</code>), auto-formats <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded font-mono">.2 &rarr; 0.2</code>, removes leading zeros (<code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded font-mono">0000.2 &rarr; 0.2</code>), and supports steppers &amp; currency.
                  </p>
                </div>

                {/* Interactive Live Sandbox */}
                <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl mb-6 shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Interactive Number Validation Sandbox</h4>
                    <span className="text-[11px] text-indigo-600 font-medium">Try typing &quot;.2&quot;, &quot;0000.5&quot;, &quot;e&quot;, &quot;E&quot;, or letters</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <NumberInput
                      label="Test Input (Decimals &amp; Negative allowed)"
                      placeholder="Type .5 or 0000.25 or letters..."
                      value={liveNumStr}
                      onValueChange={(numeric, str) => {
                        setLiveNumStr(str);
                        setLiveNumVal(numeric);
                      }}
                      allowDecimals={true}
                      allowNegative={true}
                      isClearable
                    />

                    <div className="p-3.5 bg-white border border-indigo-200/80 rounded-xl space-y-1.5 font-mono text-xs shadow-2xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Raw String (`str`):</span>
                        <strong className="text-indigo-600">&quot;{liveNumStr}&quot;</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Parsed Number (`val`):</span>
                        <strong className="text-emerald-600">{liveNumVal !== undefined ? liveNumVal : "undefined"}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>typeof Output:</span>
                        <strong className="text-slate-800">{liveNumVal !== undefined ? typeof liveNumVal : "undefined"}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Currency & Financial */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Currency &amp; Decimal Formats</h4>
                    <NumberInput
                      label="Monthly Maintenance Dues"
                      required
                      prefix="₹"
                      placeholder="5,500.00"
                      decimalScale={2}
                      min={0}
                      value={duesAmount}
                      onValueChange={(val) => setDuesAmount(val)}
                      helperText="Capped at 2 decimal digits with currency prefix."
                    />
                    <NumberInput
                      label="Service Tax Rate"
                      suffix="%"
                      placeholder="18.0"
                      min={0}
                      max={100}
                      step={0.5}
                      showSteppers
                      defaultValue={18}
                    />
                  </div>

                  {/* Card 2: Units, Limits & Steppers */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Steppers, Units &amp; Integers</h4>
                    <NumberInput
                      label="Total Assigned Parking Slots"
                      placeholder="e.g. 2"
                      allowDecimals={false}
                      min={0}
                      max={10}
                      showSteppers
                      defaultValue={2}
                      helperText="Integer only (decimals strictly disallowed)."
                    />
                    <NumberInput
                      label="Flat / Unit Carpet Area"
                      placeholder="1250"
                      suffix="sq ft"
                      min={0}
                      defaultValue={1420}
                    />
                  </div>
                </div>

                {/* NumberInput Sizing Scale */}
                <div className="mt-6 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">NumberInput Size Scale</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <NumberInput
                      size="sm"
                      label="Small (`size='sm'` / 34px)"
                      placeholder="100"
                      prefix="₹"
                      showSteppers
                      defaultValue={100}
                    />
                    <NumberInput
                      size="md"
                      label="Medium / Default (`size='md'` / 40px)"
                      placeholder="250"
                      prefix="₹"
                      showSteppers
                      defaultValue={250}
                    />
                    <NumberInput
                      size="lg"
                      label="Large (`size='lg'` / 44px)"
                      placeholder="500"
                      prefix="₹"
                      showSteppers
                      defaultValue={500}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: TEXTAREA */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">3. Text Area (&lt;Textarea /&gt;)</h3>
                  <p className="text-xs text-slate-500">
                    Multi-line text input with integrated accessible labels, dynamic live character counters, resize controls, validation error text, helper hints, clear buttons, and standalone mode.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Integrated Labels & Dynamic Live Counter */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Integrated Labels &amp; Dynamic Live Counter</h4>
                    <Textarea
                      label="Special Maintenance Instructions"
                      required
                      rows={3}
                      placeholder="Detail any vendor access restrictions, specific tools needed, or resident requests..."
                      value={liveTextarea}
                      onChange={(e) => setLiveTextarea(e.target.value)}
                      charCount={{ max: 150 }}
                      helperText="Live character counter updates automatically as you type."
                      isClearable
                    />

                    <Textarea
                      label="Public Meeting Agenda / Notes"
                      placeholder="Agenda items to be discussed at the monthly board meeting..."
                      rows={3}
                      defaultValue="1. Financial audit review&#10;2. Clubhouse repainting bids&#10;3. Security guard gate log review"
                      charCount={{ max: 300 }}
                    />
                  </div>

                  {/* Card 2: Validation States & Resize Controls */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Validation Error &amp; Resize Variants</h4>
                    <Textarea
                      label="Incident Report Summary"
                      required
                      rows={3}
                      placeholder="Describe what occurred in detail..."
                      defaultValue="Water leak in basement"
                      error="Please provide at least 25 characters describing the incident location and impact."
                    />

                    <Textarea
                      label="Fixed Height / No Resize (`resize='none'`)"
                      placeholder="Non-resizable textarea..."
                      rows={2}
                      resize="none"
                      helperText="Resizing handle is disabled via resize='none'."
                    />
                  </div>
                </div>

                {/* Textarea Sizing Scale */}
                <div className="mt-6 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Textarea Size Scale</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Textarea
                      size="sm"
                      label="Small (`size='sm'` / min-h-[70px])"
                      placeholder="Compact density notes..."
                      rows={2}
                    />
                    <Textarea
                      size="md"
                      label="Medium / Default (`size='md'` / min-h-[90px])"
                      placeholder="Standard textarea notes..."
                      rows={3}
                    />
                    <Textarea
                      size="lg"
                      label="Large (`size='lg'` / min-h-[110px])"
                      placeholder="Spacious textarea notes..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: DATE COMPONENTS SUITE */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">4. Date &amp; Time Suite (&lt;DatePicker /&gt;, &lt;DateTimePicker /&gt;, &lt;MonthPicker /&gt;, &lt;YearPicker /&gt;, &lt;DateRangePicker /&gt;)</h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive date &amp; time selection suite supporting Single Date, Date &amp; Time (12h/24h with time presets), Single Month, Year, and Date Range with quick presets, decade jumps, integrated form labels, validation error text, and clear buttons.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Single Date Picker */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">1. Single Date Picker (`mode='date'`)</h4>
                      <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {singleDate || "none"}
                      </span>
                    </div>

                    <DatePicker
                      label="Community AGM Meeting Date"
                      required
                      value={singleDate}
                      onChange={(val) => setSingleDate(val)}
                      isClearable
                      helperText="Click month/year header inside calendar for fast jumping."
                    />

                    <DatePicker
                      label="Pool Safety Inspection Date"
                      required
                      defaultValue="2026-08-10"
                      error="Selected inspection date has already passed. Please select an upcoming date."
                    />

                    <DatePicker
                      label="Restricted Range (Q3 2026 Only)"
                      placeholder="Choose date between Jul 1 and Sep 30..."
                      minDate="2026-07-01"
                      maxDate="2026-09-30"
                      helperText="Constrained to July 1, 2026 - September 30, 2026."
                    />
                  </div>

                  {/* Card 2: Date & Time Picker */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">2. Date &amp; Time Picker (&lt;DateTimePicker /&gt;)</h4>
                      <span className="text-[11px] font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                        {dateTimeVal || "none"}
                      </span>
                    </div>

                    <DateTimePicker
                      label="Community Event Start (12h with Presets)"
                      required
                      value={dateTimeVal}
                      onChange={(val) => setDateTimeVal(val)}
                      isClearable
                      minuteStep={5}
                      timeFormat="12h"
                      helperText="Interactive calendar + 12h time selection with quick time presets."
                    />

                    <DateTimePicker
                      label="Security Maintenance Window (24h Format)"
                      defaultValue="2026-09-20T23:30"
                      timeFormat="24h"
                      isClearable
                      helperText="24-hour hour & minute selectors."
                    />

                    <DateTimePicker
                      label="Past Booking Window (Validation Error)"
                      defaultValue="2026-08-01T14:00"
                      error="Event starts_at cannot be in the past."
                    />
                  </div>

                  {/* Card 3: Date Range Picker */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">3. Date Range Picker (`mode='range'`)</h4>
                      <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {dateRangeVal.from && dateRangeVal.to
                          ? `${dateRangeVal.from} &rarr; ${dateRangeVal.to}`
                          : "incomplete"}
                      </span>
                    </div>

                    <DateRangePicker
                      label="Visitor Parking Reservation Period"
                      required
                      value={dateRangeVal}
                      onChange={(range) => setDateRangeVal({ from: range.from, to: range.to })}
                      isClearable
                      helperText="Includes quick sidebar presets ('Last 7 Days', 'This Month', etc.)."
                    />

                    <DateRangePicker
                      label="Fiscal Audit Filter Range"
                      placeholder="Pick financial reporting window..."
                      defaultValue={{ from: "2026-01-01", to: "2026-06-30" }}
                    />
                  </div>

                  {/* Card 4: Month Picker */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">4. Single Month Picker (`mode='month'`)</h4>
                      <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {monthVal || "none"}
                      </span>
                    </div>

                    <MonthPicker
                      label="Financial Statement Reporting Month"
                      required
                      value={monthVal}
                      onChange={(val) => setMonthVal(val)}
                      isClearable
                      helperText="12-month grid with quick 'This Month' action."
                    />

                    <MonthPicker
                      label="Maintenance Dues Assessment Period"
                      defaultValue="2026-10"
                      helperText="Select billing month & year."
                    />
                  </div>

                  {/* Card 5: Year Picker */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs md:col-span-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">5. Single Year Picker (`mode='year'`)</h4>
                      <span className="text-[11px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                        {yearVal || "none"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <YearPicker
                        label="Society Tax Assessment Year"
                        required
                        value={yearVal}
                        onChange={(val) => setYearVal(val)}
                        isClearable
                        helperText="12-year decade selector with multi-decade jump."
                      />

                      <YearPicker
                        label="Building Construction Year"
                        defaultValue="2018"
                        helperText="Record original property structural establishment year."
                      />
                    </div>
                  </div>
                </div>

                {/* Date & DateTime Picker Sizing Scale */}
                <div className="mt-6 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Date Picker Size Scale</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <DatePicker
                        size="sm"
                        label="Small (`size='sm'` / 32px)"
                        placeholder="Pick date..."
                        defaultValue="2026-09-05"
                      />
                      <DatePicker
                        size="md"
                        label="Medium / Default (`size='md'` / 40px)"
                        placeholder="Pick date..."
                        defaultValue="2026-09-05"
                      />
                      <DatePicker
                        size="lg"
                        label="Large (`size='lg'` / 48px)"
                        placeholder="Pick date..."
                        defaultValue="2026-09-05"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">DateTime Picker Size Scale</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <DateTimePicker
                        size="sm"
                        label="Small (`size='sm'` / 32px)"
                        placeholder="Pick date & time..."
                        defaultValue="2026-09-12T18:30"
                      />
                      <DateTimePicker
                        size="md"
                        label="Medium / Default (`size='md'` / 40px)"
                        placeholder="Pick date & time..."
                        defaultValue="2026-09-12T18:30"
                      />
                      <DateTimePicker
                        size="lg"
                        label="Large (`size='lg'` / 48px)"
                        placeholder="Pick date & time..."
                        defaultValue="2026-09-12T18:30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: CHECKBOX */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">5. Checkbox (&lt;Checkbox /&gt; &amp; &lt;CheckboxGroup /&gt;)</h3>
                  <p className="text-xs text-slate-500">
                    Accessible, hardware-accelerated checkboxes supporting integrated labels, descriptions, indeterminate minus states, color themes, validation error messages, and multi-option groups.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Integrated Labels, Descriptions & Indeterminate */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Integrated Labels &amp; States</h4>
                    
                    <Checkbox
                      label="Pin announcement to top of community feed"
                      description="Keep this notice pinned at the top of resident feeds for 7 days."
                      checked={pinnedChecked}
                      onCheckedChange={(c) => setPinnedChecked(Boolean(c))}
                    />

                    <Checkbox
                      label="Send emergency SMS broadcast"
                      description="Triggers instant SMS push to all registered resident mobile numbers."
                      variant="moss"
                      defaultChecked
                    />

                    <Checkbox
                      label="Select all residential units (14 / 28 selected)"
                      description="Indeterminate minus icon indicator for partial parent-child selections."
                      checked="indeterminate"
                    />

                    <Checkbox
                      label="Disabled read-only preference"
                      description="This setting is locked by association administrative governance."
                      disabled
                      defaultChecked
                    />
                  </div>

                  {/* Card 2: Validation & Theme Variants */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Validation &amp; Color Variants</h4>
                    
                    <Checkbox
                      label="Accept Society Bylaws &amp; Deed Restrictions"
                      required
                      checked={termsChecked}
                      onCheckedChange={(c) => setTermsChecked(Boolean(c))}
                      error={!termsChecked ? "You must accept the terms before submitting your application." : undefined}
                      helperText={termsChecked ? "Accepted on September 5, 2026" : undefined}
                    />

                    <div className="pt-2">
                      <span className="text-xs font-bold text-slate-700 block mb-2">Color Theme Variants</span>
                      <div className="flex flex-wrap items-center gap-4">
                        <Checkbox label="Primary (Blue)" variant="primary" defaultChecked />
                        <Checkbox label="Moss (Brand)" variant="moss" defaultChecked />
                        <Checkbox label="Slate (Dark)" variant="slate" defaultChecked />
                        <Checkbox label="Danger (Rose)" variant="danger" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkbox Group & Sizing Scale */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Group */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Multi-Option Checkbox Group</h4>
                    <CheckboxGroup
                      label="Assigned Amenity Access Permissions"
                      description="Select which facilities this resident or tenant keycard can access."
                      value={selectedAmenities}
                      onChange={setSelectedAmenities}
                      options={[
                        { value: "pool", label: "Swimming Pool & Sun Deck", description: "6:00 AM - 10:00 PM access" },
                        { value: "gym", label: "Fitness Center & Squash Court", description: "24/7 keycard entry" },
                        { value: "clubhouse", label: "Community Banquet Hall", description: "Requires security deposit per booking" },
                        { value: "tennis", label: "Tennis & Pickleball Courts", description: "Floodlights reservation enabled" },
                      ]}
                    />
                  </div>

                  {/* Size Scale */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Checkbox Size Scale</h4>
                    <div className="space-y-4">
                      <Checkbox
                        size="sm"
                        label="Small Checkbox (`size='sm'` / 16px)"
                        description="Compact density for dense tables and data rows."
                        defaultChecked
                      />
                      <Checkbox
                        size="md"
                        label="Medium / Default (`size='md'` / 20px)"
                        description="Standard size for most modal forms and dialogs."
                        defaultChecked
                      />
                      <Checkbox
                        size="lg"
                        label="Large Checkbox (`size='lg'` / 24px)"
                        description="High-touch targets for mobile devices and hero forms."
                        defaultChecked
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6: RADIO BUTTONS */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">6. Radio Buttons (&lt;Radio /&gt; &amp; &lt;RadioGroup /&gt;)</h3>
                  <p className="text-xs text-slate-500">
                    Mutually exclusive single-choice selectors supporting interactive card tiles with badges, standard stacked/inline layouts, color themes, validation error messages, and accessible keyboard navigation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Interactive Card Tiles */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Interactive Selectable Cards (`variantStyle='card'`)</h4>
                    
                    <RadioGroup
                      name="subscription_plan"
                      label="Community Subscription Plan"
                      required
                      variantStyle="card"
                      value={billingPlan}
                      onChange={setBillingPlan}
                      options={[
                        {
                          value: "annual",
                          label: "Annual Pro Plan",
                          description: "Full access to amenities, gate QR passes, and accounting ledger. Billed annually.",
                          badge: <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">SAVE 20%</span>,
                        },
                        {
                          value: "monthly",
                          label: "Monthly Flexible Plan",
                          description: "Pay month-to-month with standard community management tools.",
                        },
                        {
                          value: "enterprise",
                          label: "Master Association Suite",
                          description: "Multi-cluster portfolio management with dedicated SLA and custom webhooks.",
                          badge: <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/70">ENTERPRISE</span>,
                        },
                      ]}
                    />
                  </div>

                  {/* Card 2: Standard Radios & Color Themes */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Standard Layout &amp; Validation</h4>
                    
                    <RadioGroup
                      name="notification_delivery"
                      label="Emergency Dispatch Channel"
                      required
                      value={notificationChannel}
                      onChange={setNotificationChannel}
                      options={[
                        { value: "push_email", label: "Mobile Push Notification & Email Digest", description: "Standard default communication path" },
                        { value: "sms_urgent", label: "Priority SMS & Voice Blast", description: "Direct carrier SMS to registered numbers" },
                        { value: "portal_only", label: "Association Dashboard Only", description: "Post to web feed silently without alerts" },
                      ]}
                      helperText="Delivers immediate broadcasts during urgent maintenance or weather events."
                    />

                    <div className="pt-2">
                      <span className="text-xs font-bold text-slate-700 block mb-2">Color Theme Variants</span>
                      <div className="flex flex-wrap items-center gap-4">
                        <Radio value="c1" label="Primary (Blue)" variant="primary" checked readOnly />
                        <Radio value="c2" label="Moss (Brand)" variant="moss" checked readOnly />
                        <Radio value="c3" label="Slate (Dark)" variant="slate" checked readOnly />
                        <Radio value="c4" label="Danger (Rose)" variant="danger" checked readOnly />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Radio Size Scale */}
                <div className="mt-6 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Radio Size Scale</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Radio
                      size="sm"
                      value="s1"
                      label="Small Radio (`size='sm'` / 16px)"
                      description="Compact density for dense tables."
                      checked
                      readOnly
                    />
                    <Radio
                      size="md"
                      value="s2"
                      label="Medium / Default (`size='md'` / 20px)"
                      description="Standard size for modal forms."
                      checked
                      readOnly
                    />
                    <Radio
                      size="lg"
                      value="s3"
                      label="Large Radio (`size='lg'` / 24px)"
                      description="High-touch target for mobile."
                      checked
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 7: SWITCH (TOGGLE BUTTON) */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">7. Toggle Switch (&lt;Switch /&gt;)</h3>
                  <p className="text-xs text-slate-500">
                    Smooth, hardware-accelerated binary state toggles supporting interactive card tiles, inline labels, color themes, validation states, and size scales.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Switches with Labels & Descriptions */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Toggle Switches with Labels</h4>

                    <Switch
                      label="Automated Recurring Maintenance Dues"
                      description="Automatically charge member linked bank account on the 1st of every month."
                      checked={autoBilling}
                      onCheckedChange={setAutoBilling}
                    />

                    <div className="pt-1 border-t border-slate-100">
                      <Switch
                        label="Two-Factor SMS Verification"
                        description="Require OTP challenge on every admin and treasurer login."
                        variant="moss"
                        checked={smsAlerts}
                        onCheckedChange={setSmsAlerts}
                      />
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <Switch
                        label="Locked Association Core Policy"
                        description="Master ledger audit lock enabled by board resolution."
                        disabled
                        defaultChecked
                      />
                    </div>
                  </div>

                  {/* Card 2: Validation States & Color Themes */}
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Validation States &amp; Color Themes</h4>

                    <Switch
                      label="Enable Gate Visitor Fast-Pass QR Codes"
                      description="Generates dynamic 1-time gate QR passes for expected guests."
                      defaultChecked
                    />

                    <div className="pt-1 border-t border-slate-100">
                      <Switch
                        label="Mandatory Resident Liability Acknowledgment"
                        required
                        error="Acknowledgment must be enabled before activating clubhouse bookings."
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-700 block mb-3">Color Theme Variants</span>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch variant="primary" defaultChecked />
                          <span className="text-xs text-slate-600 font-medium">Primary</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch variant="moss" defaultChecked />
                          <span className="text-xs text-slate-600 font-medium">Moss</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch variant="success" defaultChecked />
                          <span className="text-xs text-slate-600 font-medium">Success</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch variant="slate" defaultChecked />
                          <span className="text-xs text-slate-600 font-medium">Slate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch variant="danger" defaultChecked />
                          <span className="text-xs text-slate-600 font-medium">Danger</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Switch Size Scale */}
                <div className="mt-6 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Switch Size Scale</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                    <div className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl">
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">Small Switch</span>
                        <span className="text-[10px] text-slate-400">`size='sm'` / Compact density</span>
                      </div>
                      <Switch size="sm" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl">
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">Medium / Default</span>
                        <span className="text-[10px] text-slate-400">`size='md'` / Standard modal</span>
                      </div>
                      <Switch size="md" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl">
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">Large Switch</span>
                        <span className="text-[10px] text-slate-400">`size='lg'` / Touch-friendly</span>
                      </div>
                      <Switch size="lg" defaultChecked />
                    </div>
                  </div>
                </div>

                {/* SECTION 8: SELECT & MULTI-SELECT DROPDOWNS */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-800">8. Select &amp; Multi-Select (&lt;Select /&gt; &amp; &lt;MultiSelect /&gt;)</h3>
                    <p className="text-xs text-slate-500">
                      Smooth Radix-powered dropdowns with active item checkmarks, descriptions, icons, clearable buttons, and multi-tag pill selections.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card 1: Single Select Variants */}
                    <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Single Select Dropdowns</h4>

                      <FormField label="Assigned Role (With Descriptions & Icons)" required>
                        <Select
                          value={selectedRole}
                          onChange={(e: any) => setSelectedRole(typeof e === "string" ? e : (e?.target?.value ?? ""))}
                          icon={<Users size={16} />}
                          options={[
                            { value: "superadmin", label: "Super Administrator", description: "Full root access across all communities", icon: <Sparkles size={14} /> },
                            { value: "admin", label: "Association Manager", description: "Daily operations, members, and vendor oversight", icon: <Users size={14} /> },
                            { value: "treasurer", label: "Treasurer & Accountant", description: "Financial ledgers, invoices, and bank records", icon: <Wrench size={14} /> },
                            { value: "resident", label: "Homeowner / Resident", description: "Standard community portal & amenity booking", icon: <Mail size={14} /> },
                          ]}
                        />
                      </FormField>

                      <FormField label="Holding Entity (Clearable & Placeholder)">
                        <Select
                          value={selectedEntity}
                          onChange={(e: any) => setSelectedEntity(typeof e === "string" ? e : (e?.target?.value ?? ""))}
                          placeholder="Choose a management entity..."
                          clearable
                          options={[
                            { value: "greenfield", label: "Greenfield Property Management Ltd." },
                            { value: "palmgrove", label: "Palm Grove Association Holdings" },
                            { value: "oakwood", label: "Oakwood Community Trust" },
                            { value: "azure", label: "Azure Vista Residential Partners" },
                          ]}
                        />
                      </FormField>

                      <FormField label="Disabled & Error States" error="Please choose a valid tier before proceeding">
                        <Select
                          error
                          value={selectedTier}
                          onChange={(e: any) => setSelectedTier(typeof e === "string" ? e : (e?.target?.value ?? ""))}
                          placeholder="Select membership tier..."
                          options={[
                            { value: "bronze", label: "Bronze Plan", description: "Basic community access" },
                            { value: "gold", label: "Gold Plan", description: "Standard management features" },
                            { value: "platinum", label: "Platinum Plan", description: "All premium features included" },
                            { value: "enterprise", label: "Enterprise (Contact Sales)", disabled: true, description: "Requires custom organization contract" },
                          ]}
                        />
                      </FormField>
                    </div>

                    {/* Card 2: Multi-Select with Tags & Checkboxes */}
                    <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Multi-Select with Tag Pills</h4>

                      <FormField label="Notification & Audience Tags (Multi-Tag)" required>
                        <MultiSelect
                          value={selectedTags}
                          onChange={(e: any) => setSelectedTags(Array.isArray(e) ? e : (e?.target?.value ?? []))}
                          placeholder="Select distribution tags..."
                          options={[
                            { value: "maintenance", label: "Maintenance Team", description: "Facility technicians & leads" },
                            { value: "board", label: "Board Members", description: "President, secretary & treasurer" },
                            { value: "urgent", label: "Urgent Alerts", description: "Emergency SMS and push broadcast" },
                            { value: "finance", label: "Finance & Accounts", description: "Dues collection & invoice teams" },
                            { value: "social", label: "Social Committee", description: "Event organizers & club leads" },
                          ]}
                          maxDisplayTags={2}
                        />
                      </FormField>

                      <FormField label="Assigned Reviewers (With Custom Icons)">
                        <MultiSelect
                          value={selectedMembers}
                          onChange={(e: any) => setSelectedMembers(Array.isArray(e) ? e : (e?.target?.value ?? []))}
                          icon={<Users size={16} />}
                          placeholder="Choose board reviewers..."
                          options={[
                            { value: "1", label: "Hardik Patel", description: "President (Block A-402)" },
                            { value: "2", label: "Anjali Sharma", description: "Secretary (Block B-101)" },
                            { value: "3", label: "Vikram Mehta", description: "Treasurer (Block C-305)" },
                            { value: "4", label: "Priya Nair", description: "Audit Lead (Block D-502)" },
                          ]}
                        />
                      </FormField>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-700 block mb-2">Dropdown Size Scale</span>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Small (`size="sm"`)</span>
                            <Select
                              size="sm"
                              defaultValue="sm1"
                              options={[
                                { value: "sm1", label: "Small 1" },
                                { value: "sm2", label: "Small 2" },
                              ]}
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Medium (`size="md"`)</span>
                            <Select
                              size="md"
                              defaultValue="md1"
                              options={[
                                { value: "md1", label: "Medium 1" },
                                { value: "md2", label: "Medium 2" },
                              ]}
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Large (`size="lg"`)</span>
                            <Select
                              size="lg"
                              defaultValue="lg1"
                              options={[
                                { value: "lg1", label: "Large 1" },
                                { value: "lg2", label: "Large 2" },
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MotionPage>
          </TabsContent>

          {/* TAB 3: FORM FIELDS */}
          <TabsContent value="forms">
            <MotionPage className="space-y-6 max-w-2xl">
              <FormField label="Announcement Title" required helperText="A short, bold title">
                <Input placeholder="e.g. ANNUAL GENERAL MEETING" />
              </FormField>

              <FormField label="Category" required>
                <Select defaultValue="General">
                  <option value="General">General</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Celebration">Celebration</option>
                </Select>
              </FormField>

              <FormField label="Description" required charCount={{ current: 45, max: 5000 }}>
                <Textarea rows={4} placeholder="Write the details here..." defaultValue="Details regarding upcoming community events." />
              </FormField>

              <FormField label="Notification Channel">
                <RadioGroup
                  name="notification_channel"
                  value={radioVal}
                  onChange={setRadioVal}
                  options={[
                    { value: "option1", label: "Email & Dashboard Notification", description: "Send immediate push update to all homeowners" },
                    { value: "option2", label: "Dashboard Only", description: "Display on member feed without triggering email alerts" },
                  ]}
                />
              </FormField>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <span className="text-sm font-semibold text-slate-800">Pin to top of feed</span>
                  <p className="text-xs text-slate-500">Keep this announcement highlighted at the top of the feed</p>
                </div>
                <Switch checked={switchVal} onCheckedChange={setSwitchVal} />
              </div>

              <FormField label="Attachment / Media">
                <FileUploadZone
                  value={uploadedFile}
                  onChange={setUploadedFile}
                  onUpload={async (file) => {
                    return URL.createObjectURL(file);
                  }}
                />
              </FormField>
            </MotionPage>
          </TabsContent>

          {/* TAB 4: DATA TABLE */}
          <TabsContent value="table">
            <MotionPage>
              <DataTable
                data={SAMPLE_TABLE_DATA}
                searchPlaceholder="Search announcements..."
                columns={[
                  { key: "title", header: "Title", sortable: true, className: "font-semibold text-slate-900" },
                  {
                    key: "category",
                    header: "Category",
                    render: (row) => <Badge variant={row.category.toLowerCase() as any}>{row.category}</Badge>,
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (row) => <StatusBadge status={row.status} />,
                  },
                  { key: "author", header: "Author" },
                  { key: "date", header: "Date", sortable: true, className: "font-mono text-xs text-slate-500" },
                ]}
                headerActions={
                  <Button variant="default" onClick={() => setModalOpen(true)}>
                    <Plus size={16} /> New Record
                  </Button>
                }
              />
            </MotionPage>
          </TabsContent>

          {/* TAB 5: FEEDBACK & STATES */}
          <TabsContent value="feedback">
            <MotionPage className="space-y-6">
              <EmptyState
                title="No Pending Service Requests"
                description="All maintenance tickets have been addressed. Good job!"
                actionText="Create Service Request"
                onAction={() => setModalOpen(true)}
              />

              {/* MODALS & OVERLAYS SHOWCASE */}
              <div className="p-8 border border-slate-200 rounded-3xl bg-white space-y-8">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Modal Dialogs, Confirmation &amp; Delete Modals
                  </h4>
                  <p className="text-xs text-slate-500">
                    Comprehensive dialog systems built on <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">&lt;ModalWrapper /&gt;</code> with smooth Radix animations, typed safety confirmation, consequences checklist, and specialized delete flows.
                  </p>
                </div>

                {/* Group 1: General & Form Modals */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    1. Layout &amp; Form Modals
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Trigger 1: Standard ModalWrapper */}
                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">ModalWrapper</span>
                        <span className="text-[11px] text-slate-500">Info / Overview with custom footer</span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full justify-center"
                        onClick={() => setModalOpen(true)}
                      >
                        Open ModalWrapper
                      </Button>
                    </div>

                    {/* Trigger 2: Standard FormModal */}
                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">FormModal</span>
                        <span className="text-[11px] text-slate-500">Auto submit/cancel &amp; loading spinner</span>
                      </div>
                      <Button
                        variant="default"
                        className="w-full justify-center"
                        onClick={() => setFormModalOpen(true)}
                      >
                        Open FormModal
                      </Button>
                    </div>

                    {/* Trigger 3: FormModal with Extra Actions */}
                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Custom Actions Modal</span>
                        <span className="text-[11px] text-slate-500">Delete, Draft, &amp; Save buttons</span>
                      </div>
                      <Button
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={() => setCustomFormOpen(true)}
                      >
                        Open Custom Actions
                      </Button>
                    </div>

                    {/* Trigger 4: Non-Form Modal */}
                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Non-Form Modal</span>
                        <span className="text-[11px] text-slate-500">`isForm=false` with action buttons</span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full justify-center"
                        onClick={() => setNonFormOpen(true)}
                      >
                        Open Non-Form Modal
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Group 2: Confirmation Dialogs (<ConfirmDialog />) */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    2. Confirmation Dialogs (<code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">&lt;ConfirmDialog /&gt;</code>)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Confirm Danger */}
                    <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-rose-950 block">Danger Confirmation</span>
                        <span className="text-[11px] text-rose-700/80">Item highlight box &amp; destructive action</span>
                      </div>
                      <Button
                        variant="danger"
                        className="w-full justify-center"
                        onClick={() => setConfirmOpen(true)}
                      >
                        Confirm Danger
                      </Button>
                    </div>

                    {/* Confirm Warning with Consequences */}
                    <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-amber-950 block">Warning / Caution</span>
                        <span className="text-[11px] text-amber-700/80">Consequences checklist &amp; clay theme</span>
                      </div>
                      <Button
                        variant="clay"
                        className="w-full justify-center"
                        onClick={() => setConfirmWarningOpen(true)}
                      >
                        Confirm Warning
                      </Button>
                    </div>

                    {/* Confirm Success / Moss */}
                    <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-950 block">Approve / Activate</span>
                        <span className="text-[11px] text-emerald-700/80">Moss green theme for safe confirmations</span>
                      </div>
                      <Button
                        variant="moss"
                        className="w-full justify-center"
                        onClick={() => setConfirmSuccessOpen(true)}
                      >
                        Confirm Approve
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Group 3: Dedicated Delete Modal (<DeleteModal />) */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    3. Dedicated Delete Modal (<code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">&lt;DeleteModal /&gt;</code>)
                  </span>
                  <div className="max-w-md">
                    <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-rose-950 block">Standard Delete Modal</span>
                        <span className="text-[11px] text-rose-700/80">Compact destructive modal with automatic title/description &amp; consequences</span>
                      </div>
                      <Button
                        variant="danger"
                        className="w-full justify-center"
                        onClick={() => setDeleteModalOpen(true)}
                      >
                        Open Delete Modal
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </MotionPage>
          </TabsContent>
        </Tabs>

        {/* 1. STANDARD MODAL WRAPPER (Information / Overview) */}
        <ModalWrapper
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          title="Community Amenities Overview"
          subheader="Summary of available recreational facilities and booking slots."
          icon={<Sparkles size={20} className="text-blue-600" />}
          badge={<Badge variant="info">Active Policy</Badge>}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400 font-normal">Last updated: Today, 2:30 PM</span>
              <Button variant="default" onClick={() => setModalOpen(false)}>
                Done &amp; Dismiss
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100/80 text-blue-900 text-xs leading-relaxed">
              <strong>Notice:</strong> Clubhouse swimming pool is scheduled for quarterly deep cleaning this Thursday between 6:00 AM and 12:00 PM.
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 block uppercase tracking-wider">Facility Guidelines</span>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Gymnasium access is available 24/7 with RFID card.</li>
                <li>Tennis courts require prior reservation via the resident portal.</li>
                <li>Quiet hours are strictly observed between 10:00 PM and 6:00 AM.</li>
              </ul>
            </div>
          </div>
        </ModalWrapper>

        {/* 2. STANDARDIZED FORMMODAL (Create / Add / Edit) */}
        <FormModal
          isOpen={isFormModalOpen}
          onClose={() => setFormModalOpen(false)}
          title="Create New Announcement"
          description="Publish a notice to all registered community members and residents."
          icon={<Mail size={20} className="text-slate-800" />}
          size="md"
          isSubmitting={isSubmittingDemo}
          submitText="Publish Announcement"
          loadingText="Publishing Notice..."
          submitVariant="default"
          onSubmit={(e) => {
            setIsSubmittingDemo(true);
            setTimeout(() => {
              setIsSubmittingDemo(false);
              setFormModalOpen(false);
            }, 1200);
          }}
        >
          <FormField label="Announcement Title" required>
            <Input placeholder="e.g. Annual HOA General Meeting" autoFocus />
          </FormField>

          <FormField label="Target Audience" required>
            <Select
              options={[
                { value: "all", label: "All Residents & Owners" },
                { value: "owners", label: "Property Owners Only" },
                { value: "tenants", label: "Tenants Only" },
                { value: "board", label: "Board Members" },
              ]}
              defaultValue="all"
            />
          </FormField>

          <FormField label="Announcement Content" required>
            <Textarea
              rows={4}
              placeholder="Provide complete details regarding the upcoming schedule, agenda, or maintenance notice..."
            />
          </FormField>

          <div className="pt-2">
            <Switch
              label="Send Push Notification to Mobile App"
              description="Notify subscribed resident devices instantly upon publishing."
              defaultChecked
            />
          </div>
        </FormModal>

        {/* 3. FORMMODAL WITH EXTRA CUSTOM ACTIONS (Delete + Draft + Submit) */}
        <FormModal
          isOpen={isCustomFormOpen}
          onClose={() => setCustomFormOpen(false)}
          title="Edit Maintenance Ticket #TK-902"
          description="Update assignment, urgency status, and technician notes."
          size="lg"
          isSubmitting={isSubmittingDemo}
          submitText="Save Ticket Changes"
          loadingText="Saving..."
          submitVariant="default"
          extraActions={
            <Button
              type="button"
              variant="dangerGhost"
              onClick={() => {
                setCustomFormOpen(false);
                setConfirmOpen(true);
              }}
            >
              <Trash2 size={14} className="mr-1" /> Delete Ticket
            </Button>
          }
          onSubmit={(e) => {
            setIsSubmittingDemo(true);
            setTimeout(() => {
              setIsSubmittingDemo(false);
              setCustomFormOpen(false);
            }, 1000);
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Ticket Category" required>
              <Select
                options={[
                  { value: "plumbing", label: "Plumbing & Drainage" },
                  { value: "electrical", label: "Electrical & Lighting" },
                  { value: "elevator", label: "Elevator & Lift" },
                  { value: "security", label: "Access & Security" },
                ]}
                defaultValue="plumbing"
              />
            </FormField>

            <FormField label="Assigned Technician" required>
              <Input defaultValue="Robert Jenkins (Facility Lead)" />
            </FormField>
          </div>

          <FormField label="Internal Notes & Updates">
            <Textarea
              rows={3}
              defaultValue="Replacement valve ordered from vendor. Scheduled installation for tomorrow morning."
            />
          </FormField>
        </FormModal>

        {/* 4. NON-FORM MODAL (isForm={false}) */}
        <FormModal
          isOpen={isNonFormOpen}
          onClose={() => setNonFormOpen(false)}
          title="Export Financial Ledger Report"
          description="Download quarterly financial statements and dues audit reports."
          size="md"
          isForm={false}
          submitText="Download Excel XLSX"
          submitVariant="moss"
          onSubmit={() => {
            setNonFormOpen(false);
          }}
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose the export format and date bounds for the community master balance sheet and bank ledger reconciliation.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-semibold text-slate-800 block">Report Scope</span>
              <span className="text-xs text-slate-500 block font-normal">Fiscal Year 2026 - Q3 (July to September)</span>
            </div>
          </div>
        </FormModal>

        {/* 5. CONFIRM DIALOG - DANGER */}
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            setIsDeletingDemo(true);
            setTimeout(() => {
              setIsDeletingDemo(false);
              setConfirmOpen(false);
            }, 1000);
          }}
          title="Delete Role"
          itemName="Community Maintenance Supervisor"
          itemType="Role"
          description="Are you sure you want to delete this role? All assigned user accounts will lose their current operational privileges."
          confirmText="Delete Role"
          variant="danger"
          isLoading={isDeletingDemo}
        />

        {/* 6. CONFIRM DIALOG - WARNING WITH CONSEQUENCES */}
        <ConfirmDialog
          isOpen={isConfirmWarningOpen}
          onClose={() => setConfirmWarningOpen(false)}
          onConfirm={() => setConfirmWarningOpen(false)}
          title="Revoke Admin Access"
          itemName="Sarah Connor (Property Manager)"
          itemType="User Account"
          description="You are about to revoke system administrator permissions for this user account."
          variant="warning"
          confirmText="Revoke Access"
          consequences={[
            "Active sessions will be invalidated within 5 minutes.",
            "Access to billing portals and bank credentials will be suspended.",
            "Audit log entries for this account will remain permanently recorded."
          ]}
        />

        {/* 7. CONFIRM DIALOG - SUCCESS / APPROVE */}
        <ConfirmDialog
          isOpen={isConfirmSuccessOpen}
          onClose={() => setConfirmSuccessOpen(false)}
          onConfirm={() => setConfirmSuccessOpen(false)}
          title="Approve Contractor Service Contract"
          itemName="Apex Elevator Maintenance LLC (#VND-409)"
          itemType="Contract"
          description="Approve the annual maintenance service level agreement and activate automated vendor invoicing."
          variant="success"
          confirmText="Approve Contract"
        />

        {/* 8. STANDARD DELETE MODAL */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onDelete={() => {
            setIsDeletingDemo(true);
            setTimeout(() => {
              setIsDeletingDemo(false);
              setDeleteModalOpen(false);
            }, 1000);
          }}
          itemName="Whispering Palms North Wing HOA"
          itemType="Entity"
          isDeleting={isDeletingDemo}
          consequences={[
            "All associated property units (142 units) will be detached.",
            "Scheduled recurring maintenance tickets will be cancelled."
          ]}
        />
      </RoleLayout>
    </TooltipProvider>
  );
};

export default DesignSystemPage;
