# Phase 7: Secure Messaging & Notifications (Enhanced)

> **Scope: Post-MVP** | **Features: 4** | **Depends on: Phase 6 (basic messaging)**

## Goal

Enhance the basic messaging from Phase 6 into a full-featured secure communication hub with file attachments, group messages, and a robust notification system with email delivery.

---

## Features (in build order)

### Feature 7.1: Enhanced Messaging — Attachments & Rich Content

**Sequence: 1** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- File attachments in messages (images, PDFs, documents)
- Attachment upload via Supabase Storage
- Image inline preview in chat
- File download from chat
- Message search within conversations
- Message delete (soft delete — sender only, within time window)

#### Database Model Updates
```
// Add to Message model:
  attachments     Json?     // Array of { url, name, type, size }
  isDeleted       Boolean   @default(false)
  deletedAt       DateTime?
```

#### How to Test
- [ ] User can attach files to a message (images, PDFs)
- [ ] Images show inline preview in chat
- [ ] Non-image attachments show download link
- [ ] File size limits enforced (e.g., 10MB per attachment)
- [ ] Search messages by keyword within a conversation
- [ ] Sender can delete their own message within 5 minutes
- [ ] Deleted messages show "This message was deleted" placeholder

---

### Feature 7.2: Broadcast & Group Messaging

**Sequence: 2** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Provider can send broadcast messages to multiple patients (e.g., practice announcements)
- Group conversations (for care team coordination)
- Broadcast message templates
- Recipient selection (all patients, specific group, individual)

#### Database Model Updates
```
// Update Conversation model to support groups:
  type            ConversationType  @default(DIRECT)
  name            String?           // For group conversations
  participants    ConversationParticipant[]

ConversationParticipant {
  id              String    @id @default(uuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId])
  userId          String
  user            User      @relation(fields: [userId])
  joinedAt        DateTime  @default(now())
  leftAt          DateTime?

  @@unique([conversationId, userId])
}

enum ConversationType {
  DIRECT
  GROUP
  BROADCAST
}
```

#### How to Test
- [ ] Provider can create a broadcast message to all their patients
- [ ] Provider can create a group conversation with care team members
- [ ] All group members can see and reply to messages
- [ ] Broadcast messages are read-only for recipients
- [ ] Recipient filtering works (all patients, selected patients)

---

### Feature 7.3: Email Notification Delivery

**Sequence: 3** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Email delivery integration (Resend, SendGrid, or Supabase built-in)
- Email templates for:
  - Appointment reminders (24hr, 1hr before)
  - Appointment confirmation / cancellation
  - New message notification
  - Account verification
  - Password reset
- Email sending queue (async, non-blocking)
- Email delivery tracking (sent, delivered, failed)

#### Implementation Details
```
lib/email/
├── client.ts                 // Email service client
├── templates/
│   ├── appointment-reminder.tsx
│   ├── appointment-confirmation.tsx
│   ├── new-message.tsx
│   └── welcome.tsx
├── queue.ts                  // Email queue management
```

#### How to Test
- [ ] Appointment booking sends confirmation email to patient
- [ ] Reminder emails sent 24hr and 1hr before appointment
- [ ] New message triggers email if user is offline
- [ ] Password reset sends email with valid link
- [ ] Email delivery status tracked (check logs)
- [ ] Failed emails are retried
- [ ] Users who opted out don't receive marketing emails

---

### Feature 7.4: Notification Center & Preferences

**Sequence: 4** | **Complexity: Low** | **Testable independently: Yes**

#### What to build
- Full notification center page (all notifications, not just dropdown)
- Notification filters (by type, read/unread, date range)
- Bulk actions (mark all read, delete old notifications)
- Enhanced notification preferences:
  - Per-type toggle (appointment, message, system)
  - Per-channel toggle (in-app, email)
  - Quiet hours (no notifications between 10pm-8am)
- Push notification preparation (service worker registration for future)

#### Routes
```
app/(dashboard)/
├── notifications/
│   ├── page.tsx              // Full notification center
│   └── preferences/page.tsx  // Detailed preferences
```

#### How to Test
- [ ] Notification center shows all notifications with filters
- [ ] User can filter by type (appointment, message, system)
- [ ] User can filter by read/unread status
- [ ] "Mark all as read" works
- [ ] Per-type notification preferences honored
- [ ] Quiet hours prevent notifications during set period
- [ ] Notification preferences persist across sessions

---

## Phase 7 Completion Criteria

1. Messages support file attachments with inline preview
2. Providers can broadcast messages to patient groups
3. Care teams can have group conversations
4. Emails are sent for appointments, messages, and system events
5. Full notification center with granular preferences
