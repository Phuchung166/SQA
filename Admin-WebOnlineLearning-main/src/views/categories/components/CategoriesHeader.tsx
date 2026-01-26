import { Button } from '@/components/ui'
import { HiOutlinePlus } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'

interface CategoriesHeaderProps {
    onCreate: () => void
}

const CategoriesHeader = ({ onCreate }: CategoriesHeaderProps) => {
    const { t } = useTranslation()

    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-2xl font-bold">{t('categories.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    {t('categories.description')}
                </p>
            </div>
            <Button variant="solid" icon={<HiOutlinePlus />} onClick={onCreate}>
                {t('categories.createCategory')}
            </Button>
        </div>
    )
}

export default CategoriesHeader
