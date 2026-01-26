import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiSyncArtifacts,
    apiGetArtifacts,
    apiGetArtifactsByPeriod,
    apiGetArtifactsNotInPeriod,
    apiUpdateArtifactAudio,
    apiUpdateArtifact3D,
    apiUpdateArtifactImage,
    apiUpdateArtifactStory,
    apiGetArtifactAudio,
    apiGetArtifact3D,
} from '@/services/ArtifactService'
import {
    BaseState,
    baseInitialState,
    createBaseReducers,
    createBaseExtraReducers,
    createBaseExtraReducersSuccess,
} from './base/baseSlice'

export type ArtifactState = BaseState & {
    artifacts: any[]
    artifactsByPeriod: any[]
    artifactsNotInPeriod: any[]
    syncResult: any | null
}

const initialState: ArtifactState = {
    ...baseInitialState,
    artifacts: [],
    artifactsByPeriod: [],
    artifactsNotInPeriod: [],
    syncResult: null,
}

// Async thunks
export const syncArtifacts = createAsyncThunk(
    'artifact/syncArtifacts',
    async () => {
        const response = await apiSyncArtifacts()
        return response.data
    }
)

export const getArtifacts = createAsyncThunk(
    'artifact/getArtifacts',
    async () => {
        const response = await apiGetArtifacts()
        return response.data
    }
)

export const getArtifactsByPeriod = createAsyncThunk(
    'artifact/getArtifactsByPeriod',
    async (periodId: string) => {
        const response = await apiGetArtifactsByPeriod(periodId)
        return response.data
    }
)

export const getArtifactsNotInPeriod = createAsyncThunk(
    'artifact/getArtifactsNotInPeriod',
    async () => {
        const response = await apiGetArtifactsNotInPeriod()
        return response.data
    }
)

export const updateArtifactAudio = createAsyncThunk(
    'artifact/updateArtifactAudio',
    async (formData: FormData) => {
        const response = await apiUpdateArtifactAudio(formData)
        return response.data
    }
)

export const updateArtifact3D = createAsyncThunk(
    'artifact/updateArtifact3D',
    async (formData: FormData) => {
        const response = await apiUpdateArtifact3D(formData)
        return response.data
    }
)

export const updateArtifactImage = createAsyncThunk(
    'artifact/updateArtifactImage',
    async (data: { artifactId: number; url: string; remove?: boolean }) => {
        const response = await apiUpdateArtifactImage(data)
        return { artifactId: data.artifactId, data: response.data }
    }
)

export const updateArtifactStory = createAsyncThunk(
    'artifact/updateArtifactStory',
    async (data: { artifactId: number; story: string; isRemove?: boolean }) => {
        const response = await apiUpdateArtifactStory(data)
        return { artifactId: data.artifactId, data: response.data }
    }
)

export const getArtifactAudio = createAsyncThunk(
    'artifact/getArtifactAudio',
    async (artifactId: number) => {
        const response = await apiGetArtifactAudio(artifactId)
        return response.data
    }
)

export const getArtifact3D = createAsyncThunk(
    'artifact/getArtifact3D',
    async (artifactId: number) => {
        const response = await apiGetArtifact3D(artifactId)
        return response.data
    }
)

// Slice
const artifactSlice = createSlice({
    name: 'artifact',
    initialState,
    reducers: {
        ...createBaseReducers('artifact'),
        clearSyncResult: (state) => {
            state.syncResult = null
        },
    },
    extraReducers: (builder) => {
        // Sync artifacts
        createBaseExtraReducers(
            builder,
            syncArtifacts,
            'Failed to sync artifacts'
        )
        createBaseExtraReducersSuccess(
            builder,
            syncArtifacts,
            (state, action) => {
                state.syncResult = action.payload.data
            }
        )

        // Get artifacts
        createBaseExtraReducers(
            builder,
            getArtifacts,
            'Failed to fetch artifacts'
        )
        createBaseExtraReducersSuccess(
            builder,
            getArtifacts,
            (state, action) => {
                state.artifacts = action.payload.data.artifacts || []
            }
        )

        // Get artifacts by period - simplified
        builder.addCase(getArtifactsByPeriod.fulfilled, (state, action) => {
            state.artifactsByPeriod = action.payload.data.artifacts || []
        })

        // Get artifacts not in period - simplified
        builder.addCase(getArtifactsNotInPeriod.fulfilled, (state, action) => {
            state.artifactsNotInPeriod = action.payload.data.artifacts || []
        })

        // Update operations - simplified to only handle fulfilled cases
        builder
            .addCase(updateArtifactAudio.fulfilled, (state, action) => {
                const artifactIndex = state.artifacts.findIndex(
                    (artifact) => artifact.id === action.payload.data.artifactId
                )
                if (artifactIndex !== -1) {
                    state.artifacts[artifactIndex].audio =
                        action.payload.data.audio
                }
            })
            .addCase(updateArtifact3D.fulfilled, (state, action) => {
                const artifactIndex = state.artifacts.findIndex(
                    (artifact) => artifact.id === action.payload.data.artifactId
                )
                if (artifactIndex !== -1) {
                    state.artifacts[artifactIndex].model3d =
                        action.payload.data.model3d
                }
            })
            .addCase(updateArtifactImage.fulfilled, (state, action) => {
                const artifactIndex = state.artifacts.findIndex(
                    (artifact) => artifact.id === action.payload.artifactId
                )
                if (artifactIndex !== -1) {
                    state.artifacts[artifactIndex].image =
                        action.payload.data.data.image
                }
            })
            .addCase(updateArtifactStory.fulfilled, (state, action) => {
                const artifactIndex = state.artifacts.findIndex(
                    (artifact) => artifact.id === action.payload.artifactId
                )
                if (artifactIndex !== -1) {
                    state.artifacts[artifactIndex].story =
                        action.payload.data.data.story
                }
            })
    },
})

export const { clearError, setLoading, clearSyncResult } = artifactSlice.actions
export default artifactSlice.reducer
