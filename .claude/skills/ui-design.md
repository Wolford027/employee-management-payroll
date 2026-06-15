# UI Design Skill — Glass Theme (Blue + Yellow)

## Brand colors

| Role | Value |
|---|---|
| Background | `linear-gradient(135deg, #0a1628, #1e3a8a, #0f172a)` — fixed |
| Primary blue | `#2563eb` (interactive), `#3b82f6` (lighter) |
| Yellow accent | `#eab308` → `#ca8a04` gradient (CTAs, active state) |
| Text primary | `#f1f5f9` (white-ish) |
| Text muted | `#94a3b8` (slate-400) |
| Border | `rgba(255,255,255,0.12)` |

## Glass CSS classes (defined in globals.css)

| Class | Use |
|---|---|
| `.glass` | Standard cards, panels |
| `.glass-strong` | Login/register modals, overlays |
| `.glass-sidebar` | App sidebar |

## Glass recipe (raw)
```css
background: rgba(255,255,255,0.07);
backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.13);
box-shadow: 0 8px 32px rgba(0,0,0,0.3);
```

## Component theming

### Card
- Uses `.glass` via inline `style` props in `components/ui/card.tsx`
- `CardTitle` → `text-white`, `CardDescription` → `text-slate-400`

### Button variants
- `default` → blue-600 bg, white text
- `yellow` → yellow gradient, blue-950 text (primary CTA)
- `outline` → glass border, slate-200 text
- `ghost` → transparent, hover bg-white/8

### Badge (status colors — all dark-mode)
- active/present/approved/paid → green `rgba(34,197,94,...)`
- pending/late/archived → amber `rgba(245,158,11,...)`
- rejected/absent → red `rgba(239,68,68,...)`
- draft/inactive/cancelled → muted slate
- finalized/on_leave/processing → blue `rgba(59,130,246,...)`

### Form inputs (Input, Select, Textarea)
```
background: rgba(255,255,255,0.07)
border: 1px solid rgba(255,255,255,0.14)
color: white
focus: ring-2 ring-blue-500
```

### Dialog / Modal
```
background: rgba(15,34,72,0.95)
border: 1px solid rgba(255,255,255,0.15)
backdrop-filter: blur(24px)
```

### Table
- Wrapper: rounded-xl, `border: 1px solid rgba(255,255,255,0.10)`
- THead: `background: rgba(59,130,246,0.08)`, `border-bottom: 1px solid rgba(255,255,255,0.10)`
- TH: `text-blue-300`
- TD: `text-slate-300`
- TR hover: `rgba(255,255,255,0.04)`

## Sidebar

```
glass-sidebar = background: rgba(10,22,40,0.85), blur(24px)
Active nav item:
  background: rgba(59,130,246,0.15)
  border: 1px solid rgba(59,130,246,0.25)
  text: text-yellow-400 + ChevronRight icon
Inactive: text-slate-400 hover:text-white
```

## Orb decorations

Add to root body (already in `app/layout.tsx`):
```tsx
<div className="bg-orb bg-orb-blue" />   {/* top-left blue bloom */}
<div className="bg-orb bg-orb-yellow" /> {/* bottom-right yellow bloom */}
```

## Brand gradient text

```tsx
<span className="brand-gradient">EMS Payroll</span>
```

## Logo pattern

```tsx
<div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl"
  style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
  <Zap className="w-7 h-7 text-yellow-400" />
</div>
```

## Do / Don't

| Do | Don't |
|---|---|
| Use Tailwind classes for layout/spacing | Use Tailwind for glass colors (use inline style) |
| Keep text colors semantic (white, slate-*) | Use `gray-*` classes (they clash with dark bg) |
| Use `text-blue-300` for table headers | Use `text-gray-500` (invisible on dark) |
| Yellow for primary CTAs (submit, create) | Blue for primary submit buttons |
