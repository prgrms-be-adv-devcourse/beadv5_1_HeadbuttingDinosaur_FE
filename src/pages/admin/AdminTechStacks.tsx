import { FormEvent, useCallback, useEffect, useState } from 'react'
import {
  createAdminTechStack,
  deleteAdminTechStack,
  getAdminTechStacks,
  updateAdminTechStack,
} from '../../api/admin.api'
import type { AdminTechStackItem } from '../../api/types'
import { useToast } from '../../contexts/ToastContext'

export default function AdminTechStacks() {
  const { toast } = useToast()
  const [techStacks, setTechStacks] = useState<AdminTechStackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [actionId, setActionId] = useState<number | null>(null)

  const fetchTechStacks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminTechStacks()
      setTechStacks((res.data ?? []).slice().sort((a, b) => a.id - b.id))
    } catch {
      toast('기술 스택을 불러오지 못했습니다', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchTechStacks()
  }, [fetchTechStacks])

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return

    setCreating(true)
    try {
      await createAdminTechStack(trimmed)
      setNewName('')
      toast('기술 스택이 생성되었습니다', 'success')
      fetchTechStacks()
    } catch {
      toast('생성에 실패했습니다', 'error')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (item: AdminTechStackItem) => {
    setEditingId(item.id)
    setEditingName(item.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleUpdate = async (id: number) => {
    const trimmed = editingName.trim()
    if (!trimmed) {
      toast('기술 스택 이름을 입력해 주세요', 'error')
      return
    }

    setActionId(id)
    try {
      await updateAdminTechStack(id, trimmed)
      toast('기술 스택이 수정되었습니다', 'success')
      cancelEdit()
      fetchTechStacks()
    } catch {
      toast('수정에 실패했습니다', 'error')
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`'${name}' 기술 스택을 삭제할까요?`)) return
    setActionId(id)
    try {
      await deleteAdminTechStack(id)
      toast('기술 스택이 삭제되었습니다', 'success')
      if (editingId === id) cancelEdit()
      fetchTechStacks()
    } catch {
      toast('삭제에 실패했습니다', 'error')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>기술 스택 관리</h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>총 {techStacks.length}개</p>
      </div>

      <form onSubmit={handleCreate} className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className="form-input"
            placeholder="새 기술 스택 이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ maxWidth: 360 }}
          />
          <button type="submit" className="btn btn-primary" disabled={creating || !newName.trim()}>
            {creating ? '생성 중...' : '추가'}
          </button>
        </div>
      </form>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 120 }}>ID</th>
                <th>이름</th>
                <th style={{ width: 220 }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {techStacks.map((item) => {
                const isEditing = editingId === item.id
                const isActionLoading = actionId === item.id
                return (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-3)', fontSize: 13 }}>{item.id}</td>
                    <td>
                      {isEditing ? (
                        <input
                          className="form-input"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                        />
                      ) : (
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              disabled={isActionLoading}
                              onClick={() => handleUpdate(item.id)}
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              disabled={isActionLoading}
                              onClick={cancelEdit}
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            disabled={isActionLoading}
                            onClick={() => startEdit(item)}
                          >
                            수정
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          disabled={isActionLoading}
                          onClick={() => handleDelete(item.id, item.name)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
