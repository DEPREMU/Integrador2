# PillboxSettings Component Documentation

## 📋 Overview

The `PillboxSettings` component is the core interface for configuring smart pillboxes in the Capsy medication management system. It provides comprehensive functionality for managing medication schedules, patient assignments, and device configurations.

## 🏗️ Architecture

### Component Structure

```
PillboxSettings
├── Context Management (Authentication, WebSocket, Language)
├── State Management (30+ state variables)
├── Core Functions (20+ utility functions)
├── API Integration (RESTful + WebSocket)
├── UI Components (Patient Selector, Compartment Forms, Time Scheduling)
└── Real-time Communication (WebSocket event handling)
```

### Key Features

- **10 Configurable Compartments** per pillbox
- **Real-time Medication Validation** against database
- **Stock Management** for inventory tracking
- **Flexible Time Scheduling** with intervals
- **Multi-language Support** (Spanish/English)
- **Auto-save Functionality** with debouncing
- **WebSocket Communication** for real-time updates

## 🔧 State Management

### Patient Management

```typescript
selectedPatient: string              // Currently active patient ID
patients: Patient[]                  // Available patients list
loadingPatientData: boolean         // Loading state for operations
```

### Pillbox Configuration

```typescript
pillboxId: string                   // Device unique identifier
savedConfigs: SavedPillboxConfig[]  // Cached configurations
compartments: Compartment[]         // 10 compartment configurations
showPillboxIdInput: boolean         // UI state for assignment flow
```

### Medication Management

```typescript
allMedications: any[]               // Complete medication database
medicationSuggestions: {[key: number]: string[]}  // Autocomplete per compartment
validMedications: {[key: number]: boolean}        // Validation status per compartment
showSuggestions: {[key: number]: boolean}         // Dropdown visibility per compartment
```

### Time Scheduling

```typescript
timeScheduleStates: {
  [key: number]: {
    startTime: string;              // HH:MM format
    intervalHours: string;          // Hours between doses
    isIntervalFocused: boolean;     // UI focus state
  }
}
```

## 🎯 Core Functions

### Data Loading Functions

#### `loadAllMedications()`

- **Purpose**: Loads complete medication database for autocomplete
- **Performance**: Chunked processing to prevent UI blocking
- **Features**: Lazy loading, error handling, progress feedback

#### `loadPatients()`

- **Purpose**: Fetches user's assigned patients
- **Security**: Authentication validation, error logging
- **Error Handling**: Graceful degradation on API failures

#### `loadPatientMedications(patientId)`

- **Purpose**: Auto-fills compartments with patient's medications
- **Data Strategy**: Names auto-filled, dosage/stock manual entry
- **Validation**: Immediate medication validation

### Validation Functions

#### `isValidMedication(medicationName)`

- **Purpose**: Validates medications against official database
- **Languages**: English and Spanish support
- **Logic**: Case-insensitive exact matching

#### `filterMedications(searchTerm)`

- **Purpose**: Real-time autocomplete filtering
- **Performance**: Limited to 5 results, minimum 2 characters
- **Languages**: Multi-language search support

### Input Handling Functions

#### `validateNumericInput(value)`

- **Purpose**: Sanitizes numeric inputs (stock, intervals)
- **Method**: Regex-based character filtering
- **Use Cases**: Time intervals, stock quantities

#### `formatTimeInput(value)`

- **Purpose**: Auto-formats time input to HH:MM
- **Features**: Automatic colon insertion, length limiting
- **UX**: Real-time formatting as user types

### Compartment Management

#### `updateCompartment(id, field, value)`

- **Purpose**: Updates any field in any compartment
- **Type Safety**: Typed field parameter with proper constraints
- **State Management**: Immutable updates using map function

#### `addTimeSlot(compartmentId, startTime, intervalHours)`

- **Purpose**: Adds scheduled medication times
- **Validation**: Time format and interval validation
- **Constraint**: One time slot per compartment maximum

#### `removeTimeSlot(compartmentId, slotIndex)`

- **Purpose**: Removes scheduled medication times
- **Auto-save**: Triggers configuration save automatically
- **Feedback**: User notification via snackbar

### Configuration Management

#### `savePillboxConfig(patientId, pillboxId, compartments)`

- **Purpose**: Persists configuration via WebSocket
- **Communication**: Real-time WebSocket messaging
- **Feedback**: Automatic confirmation handling

#### `loadPillboxConfig(patientId)`

- **Purpose**: Retrieves saved configurations
- **Async Pattern**: Promise-based WebSocket communication
- **Fallback**: Local state integration for performance

#### `removePillboxConfig(patientId)`

- **Purpose**: Deletes patient's pillbox assignment
- **State Management**: Optimistic updates with rollback
- **UI Reset**: Complete form reset for affected patient

### Device Communication

#### `sendToPillbox(pastillaData)`

- **Purpose**: Transmits configuration to physical device
- **Protocol**: WebSocket-based capsy-individual messages
- **Features**: Device linking, schedule formatting, error handling

#### `linkPillbox(capsyId)`

- **Purpose**: Associates device with user account
- **Workflow**: Follows FLUJO_PASTILLERO_COMPLETO.md protocol
- **Integration**: Automatic integration with configuration flow

## 🔄 WebSocket Integration

### Message Types Handled

- `pillbox-config-saved`: Configuration save confirmations
- `pillbox-config-loaded`: Configuration retrieval responses
- `pillbox-config-deleted`: Deletion confirmations
- `capsy-individual`: Device configuration messages
- `add-capsy`: Device linking messages

### Real-time Features

- **Immediate Feedback**: Save/delete confirmations
- **State Synchronization**: Automatic local state updates
- **Error Handling**: User-friendly error messages
- **Date Conversion**: Proper Date object handling

## 🎨 UI Components

### Patient Selector

- **Purpose**: Radio button selection of assigned patients
- **Features**: Real-time patient loading, empty state handling
- **Integration**: Triggers complete workflow on selection change

### Compartment Forms

- **Purpose**: Individual medication configuration per compartment
- **Features**:
  - Medication autocomplete with validation
  - Dosage input with pattern validation
  - Stock tracking for inventory
  - Time scheduling integration
  - Visual validation feedback

### Time Scheduling Section

- **Purpose**: Medication timing configuration
- **Features**:
  - Start time input with auto-formatting
  - Interval specification in hours
  - Visual schedule display
  - One-slot-per-compartment constraint

### Pillbox Management

- **Purpose**: Device assignment and management
- **States**:
  - Assignment mode: For new pillbox setup
  - Management mode: For existing configurations
  - Removal functionality with confirmation

## 🔒 Security Features

### Authentication

- **Context Validation**: Safe context access with error handling
- **User Verification**: User ID validation for all operations
- **Graceful Degradation**: UI remains functional without auth

### Data Validation

- **Medication Validation**: Database-backed medication verification
- **Input Sanitization**: Numeric input validation and formatting
- **Time Validation**: Proper time format enforcement

### Error Handling

- **Network Failures**: Graceful API failure handling
- **WebSocket Errors**: Real-time error feedback
- **State Recovery**: Automatic form reset on errors

## 🌐 Internationalization

### Language Support

- **Languages**: Spanish (es) and English (en)
- **Context**: Language context integration with error handling
- **Coverage**: All user-facing text translated

### Translation Keys Used

- Form labels and placeholders
- Error messages and validation feedback
- Success confirmations and status messages
- UI navigation and instructions

## 📱 Performance Optimizations

### Loading Strategies

- **Lazy Loading**: Medications loaded only when needed
- **Chunked Processing**: Large datasets processed in batches
- **Debounced Auto-save**: 1-second delay to prevent excessive saves
- **Optimistic Updates**: UI updates before server confirmation

### Memory Management

- **Effect Cleanup**: Proper cleanup of timers and event listeners
- **State Optimization**: Minimal re-renders through dependency optimization
- **WebSocket Management**: Automatic listener cleanup on unmount

## 🧪 Testing Considerations

### Test Coverage Areas

- Component initialization and context handling
- Patient selection and data loading workflows
- Medication validation and autocomplete functionality
- Time scheduling and compartment management
- WebSocket communication and error scenarios
- Form validation and user input handling

### Mock Requirements

- API endpoints for patients and medications
- WebSocket server for real-time communication
- Authentication context providers
- Language context for translations

## 🔄 Data Flow

### User Selection Flow

```
User selects patient → loadPatientData() →
  ├── loadPillboxConfig() (if exists)
  └── loadPatientMedications() (if new)
→ Update UI → Auto-save ready
```

### Configuration Flow

```
User modifies compartment → updateCompartment() →
Auto-save trigger (debounced) → savePillboxConfig() →
WebSocket message → Server response → Local state update
```

### Device Communication Flow

```
User clicks "Send to Pillbox" → Validation checks →
linkPillbox() (if needed) → sendToPillbox() →
capsy-individual message → Device configuration → User feedback
```

## 📚 Dependencies

### React Dependencies

- `useState`, `useEffect` for state management
- Context hooks for UserContext, WebSocketContext, LanguageContext

### UI Libraries

- React Native Paper for input components
- React Native components for layout

### External APIs

- `/getUserPatients` - Patient list retrieval
- `/getUserMedications` - Patient medication loading
- `/getAllMedications` - Complete medication database

### WebSocket Events

- Custom event system for real-time communication
- Event types: pillbox-config-\*, capsy-individual, add-capsy

## 🎯 Future Enhancements

### Potential Improvements

- **Offline Support**: Local storage for offline configuration
- **Bulk Operations**: Multi-patient configuration management
- **Advanced Scheduling**: Recurring patterns, skip days
- **Analytics Integration**: Usage tracking and reporting
- **Voice Commands**: Accessibility improvements
- **QR Code Scanning**: Device pairing simplification

### Scalability Considerations

- **Pagination**: For large patient lists
- **Virtualization**: For extensive medication databases
- **Caching Strategies**: Improved performance for frequent operations
- **Background Sync**: Offline-to-online synchronization

---

_This documentation covers the complete PillboxSettings component as of August 2025. For implementation details, refer to the inline JSDoc comments in the source code._
