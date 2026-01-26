import { Button } from '@/components/ui'
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { Category } from '@/@types/online-learning'
import { useTranslation } from 'react-i18next'

interface CategoryActionsProps {
    category: Category
    onEdit: (category: Category) => void
    onDelete: (category: Category) => void
}

const CategoryActions = ({
    category,
    onEdit,
    onDelete,
}: CategoryActionsProps) => {
    const { t } = useTranslation()

    return (
        <div className="flex items-center gap-2">
            <Button
                size="xs"
                variant="twoTone"
                icon={<HiOutlinePencil />}
                onClick={() => onEdit(category)}
            >
                {t('categories.actions.edit')}
            </Button>
            <Button
                size="xs"
                variant="twoTone"
                color="red-600"
                icon={<HiOutlineTrash />}
                disabled={
                    category.totalCourses != null && category.totalCourses > 0
                }
                onClick={() => onDelete(category)}
            >
                {t('categories.actions.delete')}
            </Button>
        </div>
    )
}

export default CategoryActions
