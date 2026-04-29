/**
 * 마이페이지 설정 탭 — 프로필 수정 / 비밀번호 변경 / 판매자 신청 / 회원 탈퇴.
 *
 * v1 `MyPage.tsx :: SettingsTab` 의 기능을 v2 컴포넌트 (Card/Button/Input/Chip)
 * 로 옮긴 것. updateProfile / changePassword / withdrawUser 는 ApiResponse
 * 래퍼로 응답이 오므로 호출 측에서는 성공 여부만 확인.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  changePassword,
  getTechStacks,
  updateProfile,
  withdrawUser,
} from '@/api/auth.api';
import type { TechStackItem } from '@/api/types';
import { Button, Card, Chip, Input } from '@/components';
import { POSITION_OPTIONS } from '@/constants/profile';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

import { SellerApplicationCard } from './SellerApplicationCard';

export function SettingsTab() {
  const { user, refresh, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [position, setPosition] = useState(user?.position ?? '');
  const [techStackOptions, setTechStackOptions] = useState<TechStackItem[]>([]);
  const [selectedStackIds, setSelectedStackIds] = useState<number[]>(
    () => (user?.techStacks ?? []).map((s) => s.techStackId),
  );

  const [pw, setPw] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    setNickname(user?.nickname ?? '');
    setPosition(user?.position ?? '');
    setSelectedStackIds((user?.techStacks ?? []).map((s) => s.techStackId));
  }, [user]);

  useEffect(() => {
    getTechStacks()
      .then((res) => setTechStackOptions(res.data.techStacks ?? []))
      .catch(() => toast('기술 스택 목록을 불러오지 못했습니다.', 'error'));
  }, [toast]);

  const toggleStack = (id: number) => {
    setSelectedStackIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        nickname,
        position,
        techStackIds: selectedStackIds,
      });
      await refresh();
      toast('프로필이 수정되었습니다.', 'success');
    } catch {
      toast('프로필 수정에 실패했습니다.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePw = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmPassword) {
      toast('새 비밀번호가 일치하지 않습니다.', 'error');
      return;
    }
    if (pw.newPassword.length < 8) {
      toast('새 비밀번호는 8자 이상이어야 합니다.', 'error');
      return;
    }
    setSavingPw(true);
    try {
      await changePassword({
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
        newPasswordConfirm: pw.confirmPassword,
      });
      toast('비밀번호가 변경되었습니다.', 'success');
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인하세요.', 'error');
    } finally {
      setSavingPw(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    try {
      await withdrawUser();
      toast('탈퇴되었습니다.', 'success');
      logout();
      navigate('/login');
    } catch {
      toast('탈퇴에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="settings-tab">
      <Card variant="solid" className="settings-card">
        <h2 className="settings-card__title">프로필 수정</h2>
        <form className="settings-form" onSubmit={handleSaveProfile}>
          <Input
            label="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <div className="settings-field">
            <span className="settings-field__label">포지션</span>
            <div className="settings-chip-row">
              {POSITION_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  active={position === opt.value}
                  onClick={() => setPosition(opt.value)}
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="settings-field">
            <span className="settings-field__label">기술 스택</span>
            <div className="settings-chip-row">
              {techStackOptions.map((stack) => (
                <Chip
                  key={stack.techStackId}
                  active={selectedStackIds.includes(stack.techStackId)}
                  onClick={() => toggleStack(stack.techStackId)}
                >
                  {stack.name}
                </Chip>
              ))}
            </div>
            {selectedStackIds.length > 0 && (
              <span className="settings-field__hint">
                {selectedStackIds.length}개 선택됨
              </span>
            )}
          </div>
          <div className="settings-form__actions">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={savingProfile}
              disabled={savingProfile}
            >
              저장
            </Button>
          </div>
        </form>
      </Card>

      {user?.providerType === 'LOCAL' && (
        <Card variant="solid" className="settings-card">
          <h2 className="settings-card__title">비밀번호 변경</h2>
          <form className="settings-form" onSubmit={handleChangePw}>
            <Input
              label="현재 비밀번호"
              type="password"
              value={pw.currentPassword}
              onChange={(e) =>
                setPw((p) => ({ ...p, currentPassword: e.target.value }))
              }
            />
            <Input
              label="새 비밀번호"
              type="password"
              value={pw.newPassword}
              onChange={(e) =>
                setPw((p) => ({ ...p, newPassword: e.target.value }))
              }
            />
            <Input
              label="새 비밀번호 확인"
              type="password"
              value={pw.confirmPassword}
              onChange={(e) =>
                setPw((p) => ({ ...p, confirmPassword: e.target.value }))
              }
            />
            <div className="settings-form__actions">
              <Button
                type="submit"
                variant="ghost"
                size="md"
                loading={savingPw}
                disabled={savingPw}
              >
                비밀번호 변경
              </Button>
            </div>
          </form>
        </Card>
      )}

      {user?.role === 'USER' && <SellerApplicationCard />}

      <Card variant="solid" className="settings-card settings-danger">
        <div className="settings-danger__head">위험 구역</div>
        <div className="settings-danger__row">
          <span className="settings-danger__desc">
            계정을 삭제하면 모든 데이터가 사라집니다.
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWithdraw}
            className="settings-danger__btn"
          >
            회원 탈퇴
          </Button>
        </div>
      </Card>
    </div>
  );
}

SettingsTab.displayName = 'SettingsTab';
