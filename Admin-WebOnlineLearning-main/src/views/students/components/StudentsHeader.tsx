import { useTranslation } from 'react-i18next'

const StudentsHeader = () => {
    const { t } = useTranslation()

    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-2xl font-bold">{t('students.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    {t('students.description')}
                </p>
            </div>
        </div>
    )
}

export default StudentsHeader
