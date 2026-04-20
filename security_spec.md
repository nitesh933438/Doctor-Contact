# Security Specification - Doctor Appointment System

## Data Invariants
1. **User Profiles**: A user can only create/update their own profile. The 'role' can only be set to 'admin' by an existing admin (bootstrap exception handled in code, but rules should restrict).
2. **Doctors**: Publicly readable. Only admins can create, update, or delete doctors.
3. **Appointments**:
    - Patients can only read their own appointments.
    - Patients can only create appointments for themselves (`patientId` must match `auth.uid`).
    - Patients cannot update 'status' or 'paymentStatus' directly (or very restricted).
    - Admins have full access to all appointments.

## The Dirty Dozen (Test Payloads)
1. **Identity Theft**: Update another user's profile. (Denied)
2. **Role Escalation**: Patient trying to change their role to 'admin'. (Denied)
3. **Ghost Doctor**: Non-admin creating a doctor profile. (Denied)
4. **Stolen Appointment**: Patient reading another patient's appointment. (Denied)
5. **Spoofed Patient**: Creating an appointment with another user's `patientId`. (Denied)
6. **Illegal Status**: Patient confirming their own appointment. (Denied)
7. **Orphaned Appointment**: Creating an appointment for a doctor that doesn't exist. (Denied - using `exists`)
8. **Shadow Field Injection**: Adding `isVerified: true` to a doctor document. (Denied - via `hasOnly`)
9. **Spam IDs**: Injecting 1MB strings as document IDs. (Denied - via `size()` checks)
10. **Time Travel**: Setting `createdAt` to a future date. (Denied - via `request.time`)
11. **PII Leak**: Unauthorized user listing all user emails. (Denied - `allow list` restriction)
12. **Admin Spoof**: User trying to write to `/admins/{uid}` to gain admin rights. (Denied)
