# Form Validation Implementation

This document explains how form validation is implemented in this application using **React Hook Form**, **Yup**, and **yupResolver**.

## Overview

The application uses a powerful combination of:
- **React Hook Form** - For efficient form state management and performance
- **Yup** - For declarative schema-based validation
- **@hookform/resolvers/yup** - To integrate Yup schemas with React Hook Form

This provides **real-time validation**, **type safety**, and **excellent user experience** with minimal re-renders.

---

## Libraries Used

### 1. React Hook Form
**Package:** `react-hook-form` (version 7.66.0)  
**Purpose:** Form state management, validation, and submission  
**Benefits:**
- Minimal re-renders (better performance)
- Easy integration with validation libraries
- Built-in error handling
- Support for complex forms

**Documentation:** https://react-hook-form.com/

### 2. Yup
**Package:** `yup` (version 1.7.1)  
**Purpose:** Schema validation  
**Benefits:**
- Declarative validation schemas
- Type-safe validation
- Rich validation methods
- Custom validation support

**Documentation:** https://github.com/jquense/yup

### 3. Yup Resolver
**Package:** `@hookform/resolvers` (version 5.2.2)  
**Purpose:** Connects Yup schemas to React Hook Form  
**Function:** `yupResolver` - Transforms Yup validation into React Hook Form format

**Documentation:** https://github.com/react-hook-form/resolvers

---

## How It Works

### 1. **Setup Pattern**

Every validated form follows this pattern:

```javascript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Step 1: Define validation schema
const formSchema = yup.object().shape({
    fieldName: yup
        .string()
        .required('Error message')
        .min(2, 'Minimum length message')
});

// Step 2: Initialize form with resolver
const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    resolver: yupResolver(formSchema),
    mode: 'onChange'  // Real-time validation
});

// Step 3: Handle form submission
const onSubmit = (data) => {
    // data is validated and typed
    console.log(data);
};

// Step 4: Use in JSX
<form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('fieldName')} />
    {errors.fieldName && <span>{errors.fieldName.message}</span>}
</form>
```

### 2. **Validation Modes**

The application uses `mode: 'onChange'` which means:
- ✅ Validation happens **as the user types**
- ✅ Errors appear **immediately** when validation fails
- ✅ Errors clear **automatically** when fixed
- ✅ Better user experience with instant feedback

**Other available modes:**
- `onBlur` - Validate when field loses focus
- `onSubmit` - Validate only on form submission
- `onTouched` - Validate after first interaction

### 3. **Validation Flow**

```
User Input → React Hook Form → Yup Schema → Validation Result
                ↓                                    ↓
         Update Form State                    Show/Hide Errors
                ↓
         Trigger Re-render (if needed)
```

---

## Implemented Forms

### 1. **User Login Form**
**File:** `frontend/src/Components/User/Login.jsx`

**Validation Schema:**
```javascript
const loginSchema = yup.object().shape({
    email: yup
        .string()
        .required('Email is required')
        .email('Please enter a valid email address'),
    password: yup
        .string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
});
```

**Features:**
- Email format validation
- Password minimum length (6 characters)
- Real-time error display
- Material-UI TextField integration

**Usage:**
```javascript
const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange'
});

<TextField
    {...register('email')}
    error={!!errors.email}
    helperText={errors.email?.message}
/>
```

---

### 2. **Update Profile Form**
**File:** `frontend/src/Components/User/UpdateProfile.jsx`

**Validation Schema:**
```javascript
const profileSchema = yup.object().shape({
    name: yup
        .string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .trim(),
    email: yup
        .string()
        .required('Email is required')
        .email('Please enter a valid email address'),
    avatar: yup
        .mixed()
        .nullable()
        .test('fileSize', 'Avatar must be less than 2MB', (value) => {
            if (!value || !value.size) return true;
            return value.size <= 2 * 1024 * 1024;
        })
        .test('fileType', 'Only image files are allowed', (value) => {
            if (!value || !value.type) return true;
            return value.type.startsWith('image/');
        })
});
```

**Features:**
- Name length validation (2-50 characters)
- Email format validation
- **File validation** for avatar:
  - Maximum file size: 2MB
  - Only image files allowed
- Form reset with existing user data
- File preview functionality

**File Upload Handling:**
```javascript
const onChange = e => {
    const file = e.target.files[0];
    if (file) {
        // Update form state and trigger validation
        setValue('avatar', file, { shouldValidate: true });
        // ... preview logic
    }
};
```

---

### 3. **New Product Form**
**File:** `frontend/src/Components/Admin/NewProduct.jsx`

**Validation Schema:**
```javascript
const productSchema = yup.object().shape({
    name: yup
        .string()
        .required('Product name is required')
        .max(100, 'Product name cannot exceed 100 characters')
        .trim(),
    price: yup
        .number()
        .typeError('Price must be a number')
        .required('Price is required')
        .positive('Price must be greater than 0')
        .max(99999, 'Price cannot exceed 99999'),
    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters'),
    category: yup
        .string()
        .required('Please select a category')
        .oneOf(categories, 'Please select a valid category'),
    stock: yup
        .number()
        .typeError('Stock must be a number')
        .required('Stock is required')
        .integer('Stock must be a whole number')
        .min(0, 'Stock cannot be negative')
        .max(99999, 'Stock cannot exceed 99999'),
    seller: yup
        .string()
        .required('Seller name is required')
        .trim(),
    images: yup
        .mixed()
        .test('required', 'At least one image is required', (value) => {
            return value && value.length > 0;
        })
        .test('fileSize', 'Each image must be less than 5MB', (value) => {
            if (!value || value.length === 0) return true;
            return value.every((file) => file.size <= 5 * 1024 * 1024);
        })
        .test('fileType', 'Only image files are allowed', (value) => {
            if (!value || value.length === 0) return true;
            return value.every((file) => file.type.startsWith('image/'));
        })
});
```

**Features:**
- **String validations**: Required, min/max length, trim
- **Number validations**: Type checking, positive, integer, range
- **Category validation**: Must be one of predefined categories
- **Multiple file validation**: 
  - At least one image required
  - Each image max 5MB
  - Only image files allowed
- **Custom error messages** for each field

**Multiple File Handling:**
```javascript
const onChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setValue('images', files, { shouldValidate: true });
    // ... preview logic
};
```

---

### 4. **Update Product Form**
**File:** `frontend/src/Components/Admin/UpdateProduct.jsx`

**Validation Schema:**
Similar to New Product, but with **images being optional** (since existing products already have images):

```javascript
images: yup
    .mixed()
    .nullable()  // Images are optional for updates
    .test('fileSize', 'Each image must be less than 5MB', (value) => {
        if (!value || value.length === 0) return true;  // Allow empty
        return value.every((file) => file.size <= 5 * 1024 * 1024);
    })
    .test('fileType', 'Only image files are allowed', (value) => {
        if (!value || value.length === 0) return true;  // Allow empty
        return value.every((file) => file.type.startsWith('image/'));
    })
```

**Features:**
- Same validations as New Product
- Images are **optional** (can update without changing images)
- Form pre-populated with existing product data using `reset()`

**Form Reset with Existing Data:**
```javascript
useEffect(() => {
    // Fetch product data
    getProductDetails(id);
}, [id]);

// After fetching, reset form with product data
reset({
    name: product.name,
    price: product.price,
    description: product.description,
    // ... other fields
});
```

---

## Common Validation Patterns

### 1. **String Validations**

```javascript
yup
    .string()
    .required('Field is required')
    .min(2, 'Minimum 2 characters')
    .max(50, 'Maximum 50 characters')
    .trim()  // Remove leading/trailing whitespace
```

### 2. **Number Validations**

```javascript
yup
    .number()
    .typeError('Must be a number')  // Custom error for non-numbers
    .required('Required')
    .positive('Must be positive')
    .integer('Must be whole number')
    .min(0, 'Minimum is 0')
    .max(100, 'Maximum is 100')
```

### 3. **Email Validation**

```javascript
yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
```

### 4. **File Validations**

```javascript
yup
    .mixed()
    .nullable()
    .test('fileSize', 'File too large', (value) => {
        if (!value) return true;  // Optional file
        return value.size <= 2 * 1024 * 1024;  // 2MB
    })
    .test('fileType', 'Invalid file type', (value) => {
        if (!value) return true;  // Optional file
        return value.type.startsWith('image/');
    })
```

### 5. **Multiple File Validations**

```javascript
yup
    .mixed()
    .test('required', 'At least one file required', (value) => {
        return value && value.length > 0;
    })
    .test('fileSize', 'Files too large', (value) => {
        if (!value || value.length === 0) return true;
        return value.every((file) => file.size <= 5 * 1024 * 1024);
    })
    .test('fileType', 'Invalid file types', (value) => {
        if (!value || value.length === 0) return true;
        return value.every((file) => file.type.startsWith('image/'));
    })
```

### 6. **Select/Dropdown Validation**

```javascript
yup
    .string()
    .required('Please select an option')
    .oneOf(['option1', 'option2', 'option3'], 'Invalid selection')
```

---

## React Hook Form Hooks & Methods

### **useForm()** - Main Hook

```javascript
const {
    register,        // Register input fields
    handleSubmit,    // Handle form submission
    formState: { errors },  // Access validation errors
    setValue,        // Programmatically set field values
    reset,           // Reset form to initial/default values
    watch            // Watch field values
} = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange'
});
```

### **register()** - Register Input Fields

```javascript
// Basic usage
<input {...register('fieldName')} />

// With options
<input {...register('fieldName', { 
    required: true,
    minLength: 2 
})} />
```

### **handleSubmit()** - Form Submission

```javascript
<form onSubmit={handleSubmit(onSubmit)}>
    {/* form fields */}
</form>

// onSubmit only runs if validation passes
const onSubmit = (data) => {
    // data is validated and typed
    console.log(data);
};
```

### **setValue()** - Programmatic Updates

```javascript
// Set value and trigger validation
setValue('fieldName', 'new value', { shouldValidate: true });

// Set value without validation
setValue('fieldName', 'new value');
```

### **reset()** - Reset Form

```javascript
// Reset to empty
reset();

// Reset with default values
reset({
    name: 'John',
    email: 'john@example.com'
});
```

### **errors** - Access Validation Errors

```javascript
// Check if field has error
{errors.fieldName && <span>{errors.fieldName.message}</span>}

// Access error message
errors.fieldName?.message
```

---

## Error Display Patterns

### Pattern 1: Inline Error Messages

```javascript
<input {...register('email')} />
{errors.email && (
    <div className="text-red-500 text-sm mt-1">
        {errors.email.message}
    </div>
)}
```

### Pattern 2: Material-UI Integration

```javascript
<TextField
    {...register('email')}
    error={!!errors.email}
    helperText={errors.email?.message}
/>
```

### Pattern 3: Conditional Styling

```javascript
<input
    {...register('name')}
    className={errors.name ? 'border-red-500' : 'border-gray-300'}
/>
{errors.name && <span className="text-red-500">{errors.name.message}</span>}
```

---

## File Upload Integration

### Single File Upload (Avatar)

```javascript
const [avatar, setAvatar] = useState('');

const onChange = e => {
    const file = e.target.files[0];
    if (file) {
        // Update form state
        setValue('avatar', file, { shouldValidate: true });
        
        // Update local state for preview
        setAvatar(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
    }
};

// In JSX
<input
    type="file"
    onChange={onChange}
    accept="image/*"
/>
{errors.avatar && <span>{errors.avatar.message}</span>}
```

### Multiple File Upload (Product Images)

```javascript
const [images, setImages] = useState([]);

const onChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Update form state
    setValue('images', files, { shouldValidate: true });
    
    // Update local state
    setImages(files);
    
    // Create previews
    files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
            setImagesPreview(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
    });
};
```

---

## Form Submission with FormData

For forms with file uploads, use FormData:

```javascript
const onSubmit = (data) => {
    const formData = new FormData();
    
    // Add text fields
    formData.set('name', data.name);
    formData.set('email', data.email);
    
    // Add files
    if (data.avatar) {
        formData.set('avatar', data.avatar);
    }
    
    // Submit to API
    axios.post('/api/endpoint', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
```

---

## Best Practices

### ✅ **Do:**

1. **Use descriptive error messages**
   ```javascript
   .required('Email is required')  // Good
   .required('Required')           // Less helpful
   ```

2. **Validate on change for better UX**
   ```javascript
   mode: 'onChange'  // Instant feedback
   ```

3. **Trim string inputs**
   ```javascript
   .trim()  // Remove whitespace
   ```

4. **Use typeError for number fields**
   ```javascript
   .number()
   .typeError('Must be a number')  // Better error message
   ```

5. **Make optional fields nullable**
   ```javascript
   .mixed()
   .nullable()  // For optional file uploads
   ```

6. **Reset form after successful submission**
   ```javascript
   reset();  // Clear form
   ```

### ❌ **Don't:**

1. **Don't validate in both Yup and register()**
   ```javascript
   // ❌ Bad - redundant
   <input {...register('email', { required: true })} />
   // Schema already has .required()
   
   // ✅ Good - validation only in schema
   <input {...register('email')} />
   ```

2. **Don't forget to handle file validation**
   ```javascript
   // ❌ Bad - no file validation
   .mixed()
   
   // ✅ Good - validate file size and type
   .test('fileSize', 'File too large', ...)
   .test('fileType', 'Invalid type', ...)
   ```

3. **Don't skip error display**
   ```javascript
   // ❌ Bad - no error feedback
   <input {...register('email')} />
   
   // ✅ Good - show errors
   <input {...register('email')} />
   {errors.email && <span>{errors.email.message}</span>}
   ```

---

## Troubleshooting

### Issue: Validation not working

**Solution:**
- Check that `yupResolver` is imported correctly
- Ensure schema is passed to `yupResolver()`
- Verify `mode` is set (e.g., `'onChange'`)

### Issue: File validation not triggering

**Solution:**
- Use `setValue()` with `shouldValidate: true` when files change
- Ensure file input has `onChange` handler
- Check that file object has `size` and `type` properties

### Issue: Form not resetting

**Solution:**
- Use `reset()` method from `useForm()`
- Pass default values to `reset({ field: 'value' })`
- Ensure `reset()` is called after data is loaded

### Issue: Errors not displaying

**Solution:**
- Check `errors` object from `formState`
- Use optional chaining: `errors.fieldName?.message`
- Ensure error display is in JSX

---

## Testing Validation

### Manual Testing

1. **Test required fields**: Try submitting empty form
2. **Test format validation**: Enter invalid email, short password, etc.
3. **Test file validation**: Upload large files, wrong file types
4. **Test real-time validation**: Type in fields and watch errors appear/disappear

### Example Test Cases

```javascript
// Email validation
- Empty email → "Email is required"
- "invalid" → "Please enter a valid email address"
- "valid@email.com" → No error

// Password validation
- Empty password → "Password is required"
- "123" → "Password must be at least 6 characters"
- "123456" → No error

// File validation
- No file → Error (if required)
- File > 5MB → "File too large"
- Non-image file → "Only image files allowed"
```

---

## File Structure

```
frontend/src/
├── Components/
│   ├── User/
│   │   ├── Login.jsx          # Login form validation
│   │   └── UpdateProfile.jsx  # Profile update validation
│   └── Admin/
│       ├── NewProduct.jsx     # Create product validation
│       └── UpdateProduct.jsx  # Update product validation
└── package.json               # Dependencies
```

---

## Dependencies

```json
{
  "react-hook-form": "^7.66.0",
  "yup": "^1.7.1",
  "@hookform/resolvers": "^5.2.2"
}
```

**Installation:**
```bash
npm install react-hook-form yup @hookform/resolvers
```

---

## Summary

- ✅ **Library**: React Hook Form + Yup + yupResolver
- ✅ **Validation Mode**: Real-time (`onChange`)
- ✅ **Forms Validated**: Login, Update Profile, New Product, Update Product
- ✅ **File Validation**: Supported for avatars and product images
- ✅ **Error Display**: Inline error messages with conditional styling
- ✅ **Type Safety**: Yup schemas provide type validation
- ✅ **Performance**: Minimal re-renders with React Hook Form

This implementation provides a robust, user-friendly form validation system that ensures data integrity and excellent user experience! 🚀

