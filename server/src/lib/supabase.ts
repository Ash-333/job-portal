import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  Supabase environment variables not configured. File upload will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to ensure bucket exists
const ensureBucketExists = async (bucketName: string) => {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.warn('Could not list buckets:', listError.message);
    return;
  }

  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

  if (!bucketExists) {
    console.log(`Creating bucket: ${bucketName}`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      fileSizeLimit: 10485760 // 10MB
    });

    if (createError) {
      console.error(`Failed to create bucket ${bucketName}:`, createError.message);
    } else {
      console.log(`Bucket ${bucketName} created successfully`);
    }
  }
};

// Helper function to upload file
export const uploadFile = async (
  file: Buffer,
  fileName: string,
  bucket: string,
  contentType?: string
) => {
  // Ensure bucket exists
  await ensureBucketExists(bucket);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      contentType,
      upsert: true
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
};

// Helper function to delete file
export const deleteFile = async (fileName: string, bucket: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};
