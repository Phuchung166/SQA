import { useCallback, useEffect } from 'react'
import { Notification } from '@/components/ui'
import { Container } from '@/components/shared'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Category } from '@/@types/online-learning'
import { useTranslation } from 'react-i18next'
import toast from '@/components/ui/toast'
import CategoriesHeader from './components/CategoriesHeader'
import CategoriesTableTools from './components/CategoriesTableTools'
import CategoriesTable from './components/CategoriesTable'
import CategoryFormDialog from './components/CategoryFormDialog'
import { injectReducer } from '@/store'
import reducer, {
    useAppSelector,
    useAppDispatch,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setSelectedCategory,
    setPageIndex,
    setSearch,
    setSortBy,
    setSortOrder,
    setIsActive,
    toggleCreateDialog,
    toggleUpdateDialog,
    toggleConfirmDialog,
    setConfirmMessage,
    resetState,
    SLICE_NAME,
} from './store'

injectReducer(SLICE_NAME, reducer)

interface CategoryFormData {
    name?: string
    description?: string
    image?: string
}

const Categories = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const {
        categoryList,
        loading,
        totalElements,
        pageIndex,
        pageSize,
        selectedCategory,
        search,
        sortBy,
        sortOrder,
        isActive,
        createDialog,
        updateDialog,
        confirmDialog,
        confirmAction,
        confirmMessage,
    } = useAppSelector((state) => state.categories.data)

    const fetchCategories = useCallback(() => {
        const params: any = {
            page: pageIndex, // Backend expects 1-indexed pages
            pageSize,
            sortBy,
            sortOrder,
        }

        if (search) {
            params.search = search
        }

        if (isActive !== null) {
            params.isActive = isActive
        }

        dispatch(getCategories(params))
    }, [dispatch, pageIndex, pageSize, search, sortBy, sortOrder, isActive])

    // Only fetch when non-search dependencies change
    const fetchCategoriesNonSearch = useCallback(() => {
        const params: any = {
            page: pageIndex,
            pageSize,
            sortBy,
            sortOrder,
        }

        if (search) {
            params.search = search
        }

        if (isActive !== null) {
            params.isActive = isActive
        }

        dispatch(getCategories(params))
    }, [dispatch, pageIndex, pageSize, sortBy, sortOrder, isActive, search])

    // Reset to page 1 when filters change (excluding search)
    useEffect(() => {
        if (pageIndex !== 1) {
            dispatch(setPageIndex(1))
        }
    }, [isActive, sortBy, sortOrder])

    // Fetch on initial load and when non-search filters change
    useEffect(() => {
        fetchCategoriesNonSearch()
    }, [pageIndex, pageSize, isActive, sortBy, sortOrder])

    // Manual search handler
    const handleSearch = () => {
        if (pageIndex !== 1) {
            dispatch(setPageIndex(1))
        }
        fetchCategories()
    }

    useEffect(() => {
        return () => {
            dispatch(resetState())
        }
    }, [dispatch])

    const handleCreate = () => {
        dispatch(setSelectedCategory(null))
        dispatch(toggleCreateDialog(true))
    }

    const handleEdit = (category: Category) => {
        dispatch(setSelectedCategory(category))
        dispatch(toggleUpdateDialog(true))
    }

    const handleFormSubmit = async (formData: CategoryFormData) => {
        try {
            if (selectedCategory) {
                await dispatch(
                    updateCategory({
                        id: selectedCategory.id,
                        data: formData,
                    })
                ).unwrap()
                toast.push(
                    <Notification
                        title={t('categories.messages.updateSuccess') as string}
                        type="success"
                    >
                        {t('categories.messages.updateSuccess')}
                    </Notification>
                )
            } else {
                await dispatch(createCategory(formData)).unwrap()
                toast.push(
                    <Notification
                        title={t('categories.messages.createSuccess') as string}
                        type="success"
                    >
                        {t('categories.messages.createSuccess')}
                    </Notification>
                )
            }
            fetchCategories()
        } catch (error: unknown) {
            const messageKey = selectedCategory
                ? 'categories.messages.updateError'
                : 'categories.messages.createError'
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {error instanceof Error ? error.message : t(messageKey)}
                </Notification>
            )
        }
    }

    const handleDelete = (category: Category) => {
        dispatch(setSelectedCategory(category))
        dispatch(
            setConfirmMessage(
                t('categories.confirmDelete.message', {
                    categoryName: category.name,
                }) as string
            )
        )
        // NOTE: we avoid storing functions in Redux (non-serializable).
        // The actual delete is handled by `handleConfirmDelete` when user confirms.
        dispatch(toggleConfirmDialog(true))
    }

    const handleConfirmDelete = async () => {
        if (!selectedCategory) return
        try {
            await dispatch(deleteCategory(selectedCategory.id)).unwrap()
            toast.push(
                <Notification
                    title={t('categories.messages.deleteSuccess') as string}
                    type="success"
                >
                    {t('categories.messages.deleteSuccess')}
                </Notification>
            )
            fetchCategories()
        } catch (error: unknown) {
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {error instanceof Error
                        ? error.message
                        : t('categories.messages.deleteError')}
                </Notification>
            )
        } finally {
            dispatch(toggleConfirmDialog(false))
        }
    }

    const handleCloseDialog = () => {
        dispatch(toggleCreateDialog(false))
        dispatch(toggleUpdateDialog(false))
    }

    return (
        <Container className="h-full">
            <CategoriesHeader onCreate={handleCreate} />

            <CategoriesTableTools
                search={search}
                isActive={isActive}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSearchChange={(value) => dispatch(setSearch(value))}
                onIsActiveChange={(value) => dispatch(setIsActive(value))}
                onSortByChange={(value) => dispatch(setSortBy(value))}
                onSortOrderChange={(value) => dispatch(setSortOrder(value))}
                onSearch={handleSearch}
            />

            <CategoriesTable
                categories={categoryList}
                loading={loading}
                pagination={{
                    total: totalElements,
                    pageIndex: pageIndex, // Convert 1-indexed to 0-indexed for table
                    pageSize: pageSize,
                }}
                onPaginationChange={(page: number) => {
                    console.log(
                        'Pagination change to page:',
                        page,
                        'Setting pageIndex to:',
                        page + 1
                    )
                    dispatch(setPageIndex(page)) // Convert 0-indexed to 1-indexed for store
                }}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <CategoryFormDialog
                isOpen={createDialog || updateDialog}
                selectedCategory={selectedCategory}
                loading={loading}
                onClose={handleCloseDialog}
                onSubmit={handleFormSubmit}
            />

            <ConfirmDialog
                isOpen={confirmDialog}
                title={t('categories.confirmDelete.title') as string}
                message={confirmMessage}
                type="danger"
                confirmText={t('categories.confirmDelete.confirm') as string}
                cancelText={t('categories.confirmDelete.cancel') as string}
                loading={loading}
                onClose={() => dispatch(toggleConfirmDialog(false))}
                onConfirm={handleConfirmDelete}
            />
        </Container>
    )
}

export default Categories
