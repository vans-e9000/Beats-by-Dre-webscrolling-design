# MediCore HMS — UI Redesign Design Spec

**Date:** 2026-04-19
**Status:** Approved
**Scope:** Full frontend component replacement, animation system, color restraint

## Decisions

| Decision | Choice |
|---|---|
| Design direction | Clean Clinical |
| Component source | Full 21st.dev replacement |
| Animation level | Functional (Motion library) |
| Color palette | Current 6 scales, toned down usage |

## Design Principles

1. **One accent dominates:** Teal (primary-600) for 80% of interactive elements. Other colors only for semantic purpose.
2. **White space over decoration:** No gradient cards, no glowing borders, no rainbow stat grids.
3. **1px borders, subtle shadows:** Cards use thin borders (#e2e8f0). Shadow only on elevation (modals, dropdowns).
4. **System-like typography:** Clean hierarchy. No decorative fonts. Weight contrast (700 headings, 400 body).
5. **Animations communicate state:** Every Motion animation shows a transition. Never animate for decoration.
6. **Density over decoration:** Information-dense but breathable. Compact tables, tight spacing, generous padding between sections.

## Component Replacement Plan

### Layout Components
- Sidebar → 21st.dev sidebar with collapsible sections
- Header → 21st.dev topbar with search + notifications
- DashboardLayout → Motion layout animations
- AuthLayout → Centered card with subtle background

### Common Components
- Card → 21st.dev Card (shadow-sm, border)
- Button → 21st.dev Button (primary, outline, ghost)
- Input → 21st.dev Input with floating labels
- Select → 21st.dev Select with search
- Table → 21st.dev DataTable (sortable, paginated)
- Modal → 21st.dev Dialog (Motion slide-in)
- Badge → Keep, simplify colors
- Spinner → 21st.dev Skeleton loaders

### Form Components
- FormField → 21st.dev FormField
- FormActions → 21st.dev button group
- FormError → 21st.dev alert inline

### Chart Components
- RevenueChart → 21st.dev chart with Motion bar growth
- PatientChart → 21st.dev chart with stagger animation

## Motion Animation Catalog

| Animation | Trigger | Duration | Easing |
|---|---|---|---|
| Page enter | Route change | 200ms | ease-out |
| Card mount | Component mount | 200ms + stagger | ease-out |
| Modal open | Dialog open | 150ms | spring |
| Modal close | Dialog close | 150ms | ease-in |
| Tab switch | Tab change | 200ms | crossfade |
| Chart bars | Data load | 400ms spring + 30ms stagger | spring |
| Skeleton → content | Data arrives | 300ms | fade swap |
| Table row hover | Mouse enter | 150ms | transition |
| Sidebar active | Route change | auto | slide indicator |
| Button press | Mouse down | 100ms | scale(1→0.97) |
| List items | Mount | 30ms stagger each | fade + translateY |
| Dropdown | Toggle | 200ms | spring |

Page enter: fade + translateY(8px→0)
Card mount: stagger children by 50ms, fade + scale(0.98→1)
Modal open: scale(0.95→1) + fade, backdrop fade 150ms
Modal close: scale(1→0.95) + fade out
Chart bars: height grow from 0, 400ms spring, stagger 30ms
Button press: scale(1→0.97)

## Color Usage Rules

| Color | Usage |
|---|---|
| primary (teal) | Nav active state, primary buttons, links, focus rings, chart primary series |
| secondary (slate) | Text headings, borders, disabled states |
| success (green) | "Paid" badges, online status, positive metrics only |
| warning (amber) | "Pending" badges, caution alerts, warning states only |
| danger (red) | "Overdue" badges, error messages, delete confirmations only |
| medical (blue) | Secondary chart series, medical-specific indicators only |

- No color on stat card backgrounds — white cards, teal icon only
- No gradients on cards — flat white with 1px border

## Page-by-Page Scope

### Dashboard
- Stat cards: white bg, teal icon, no colored backgrounds
- Charts: Motion bar growth, teal primary series
- Recent bills: compact list with status badges
- Quick actions: ghost buttons, not colored blocks

### Login
- Centered card, subtle gradient or pattern background
- Form with floating labels
- Button with press animation
- Error shake animation

### Patients
- DataTable with sortable columns
- Registration form with step indicators
- Detail page with tab navigation
- Staggered list animation

### Billing
- DataTable with status filters
- Create form with itemized lines
- Detail with payment timeline
- Modal for payment entry

### Reports
- Date range picker
- Animated chart transitions
- Summary cards with counter roll-up
- Export actions

### Users (Admin)
- DataTable with role badges
- Create user modal
- Role-based access indicators

## Implementation Strategy

### Phase 1 — Foundation (sequential)
1. Install 21st.dev components via CLI (`npx @21st-dev/cli add <component>`)
2. Replace common components: Card, Button, Input, Select, Table, Modal
3. Replace Skeleton/Spinner
4. Update Tailwind config (tone down color usage rules)
5. Set up Motion animation utilities (`frontend/src/utils/motion.ts`)

### Phase 2 — Pages (parallel agents)
| Agent | Scope | Files |
|---|---|---|
| A | Layout (Sidebar, Header, DashboardLayout) + Dashboard | Sidebar.tsx, Header.tsx, DashboardLayout.tsx, Dashboard.tsx |
| B | Patient pages | PatientList.tsx, PatientRegistration.tsx, PatientDetail.tsx |
| C | Billing pages | BillList.tsx, CreateBill.tsx, BillDetail.tsx |
| D | Reports + Users pages | DailySummary.tsx, RevenueReport.tsx, UserList.tsx |
| E | Login + AuthLayout | Login.tsx, AuthLayout.tsx |

Common components must complete before page agents start.
