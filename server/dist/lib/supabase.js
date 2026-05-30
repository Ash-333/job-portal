"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.uploadFile = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️  Supabase environment variables not configured. File upload will not work.');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
const ensureBucketExists = async (bucketName) => {
    const { data: buckets, error: listError } = await exports.supabase.storage.listBuckets();
    if (listError) {
        console.warn('Could not list buckets:', listError.message);
        return;
    }
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
        console.log(`Creating bucket: ${bucketName}`);
        const { error: createError } = await exports.supabase.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            fileSizeLimit: 10485760
        });
        if (createError) {
            console.error(`Failed to create bucket ${bucketName}:`, createError.message);
        }
        else {
            console.log(`Bucket ${bucketName} created successfully`);
        }
    }
};
const uploadFile = async (file, fileName, bucket, contentType) => {
    await ensureBucketExists(bucket);
    const { error } = await exports.supabase.storage
        .from(bucket)
        .upload(fileName, file, {
        contentType,
        upsert: true
    });
    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }
    const { data: { publicUrl } } = exports.supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
    return publicUrl;
};
exports.uploadFile = uploadFile;
const deleteFile = async (fileName, bucket) => {
    const { error } = await exports.supabase.storage
        .from(bucket)
        .remove([fileName]);
    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
};
exports.deleteFile = deleteFile;
//# sourceMappingURL=supabase.js.map