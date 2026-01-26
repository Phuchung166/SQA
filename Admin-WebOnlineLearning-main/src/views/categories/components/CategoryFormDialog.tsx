import React, { useEffect, useState } from 'react'
import { Button, Input, Dialog, Upload, Spinner } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { createImageUrl } from '../store/categorySlice'
import { Category } from '@/@types/online-learning'
import { useAppDispatch } from '@/store'

type CategoryFormData = {
    name?: string
    description?: string
    image?: string
}

interface CategoryFormDialogProps {
    isOpen: boolean
    selectedCategory: Category | null
    loading: boolean
    onClose: () => void
    onSubmit: (formData: CategoryFormData) => Promise<void>
}

const CategoryFormDialog = ({
    isOpen,
    selectedCategory,
    loading,
    onClose,
    onSubmit,
}: CategoryFormDialogProps) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        description: '',
        image: '',
    })
    const [uploading, setUploading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string>('')
    const [fileList, setFileList] = useState<File[]>([])

    // Reset form when dialog opens/closes or selectedCategory changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: selectedCategory?.name || '',
                description: selectedCategory?.description || '',
                image: selectedCategory?.image || '',
            })
            setImagePreview(selectedCategory?.image || '')
            // Reset fileList when opening dialog
            setFileList([])
        } else {
            // Reset everything when dialog closes
            setFormData({
                name: '',
                description: '',
                image: '',
            })
            setImagePreview('')
            setFileList([])
        }
    }, [isOpen, selectedCategory])

    const handleSubmit = () => {
        // Validate required fields
        // if (!formData.name.trim()) {
        //     alert(t('categories.form.nameRequired') || 'Name is required')
        //     return
        // }

        console.log('Submitting form data:', formData)
        console.log('Selected category:', selectedCategory)
        onSubmit(formData)
    }

    // Upload logic dùng Upload UI
    const handleUploadChange = async (files: File[]) => {
        if (!files.length) {
            setFileList([])
            setImagePreview('')
            setFormData((prev: CategoryFormData) => ({ ...prev, image: '' }))
            return
        }
        const file = files[0]
        setUploading(true)
        try {
            console.log('file name:', file.name)
            const uploadData = {
                variant: 'image',
                extension: file.name.split('.').pop() || 'jpg',
                file_name: file.name,
            }
            console.log('Requesting upload URL with data:', uploadData)
            const result = await dispatch(createImageUrl(uploadData))
            if (createImageUrl.fulfilled.match(result)) {
                const uploadResponse = result.payload as {
                    cloudFrontUrl: string
                    presignedUrl: string
                    filename: string
                }
                await fetch(uploadResponse.presignedUrl, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type,
                    },
                })
                setFormData((prev: CategoryFormData) => ({
                    ...prev,
                    image: uploadResponse.cloudFrontUrl,
                }))
                console.log('Uploaded image URL:', uploadResponse.cloudFrontUrl)
                setImagePreview(uploadResponse.cloudFrontUrl)
                setFileList([file])
            } else {
                throw new Error('Failed to get upload URL')
            }
        } catch (err) {
            console.error('Upload failed:', err)
            alert('Upload failed!')
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose}>
            <div className="p-6 w-full max-w-lg">
                <h5 className="text-lg font-semibold mb-4">
                    {selectedCategory
                        ? t('categories.editCategory')
                        : t('categories.createCategory')}
                </h5>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {t('categories.form.name')}
                        </label>
                        <Input
                            placeholder={
                                t('categories.form.namePlaceholder') as string
                            }
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {t('categories.form.description')}
                        </label>
                        <Input
                            placeholder={
                                t(
                                    'categories.form.descriptionPlaceholder'
                                ) as string
                            }
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {t('categories.form.image') || 'Image'}
                        </label>
                        <Upload
                            accept="image/*"
                            multiple={false}
                            uploadLimit={1}
                            showList={true}
                            fileList={fileList}
                            disabled={uploading}
                            onChange={handleUploadChange}
                        >
                            <Button disabled={uploading} variant="default">
                                {uploading ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner size={16} />
                                        Đang tải lên...
                                    </span>
                                ) : (
                                    'Chọn ảnh'
                                )}
                            </Button>
                        </Upload>
                        {/* {imagePreview && (
                            <div className="mt-2">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-32 rounded border"
                                />
                            </div>
                        )} */}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="default" onClick={onClose}>
                        {t('categories.form.cancel')}
                    </Button>
                    <Button
                        variant="solid"
                        loading={loading}
                        onClick={handleSubmit}
                    >
                        {loading
                            ? selectedCategory
                                ? t('categories.form.updating')
                                : t('categories.form.creating')
                            : t('categories.form.save')}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default CategoryFormDialog
