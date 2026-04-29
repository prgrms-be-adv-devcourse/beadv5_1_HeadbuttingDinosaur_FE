// Login — simple centered form, Korean labels, IDE accent only in file-header.

const { useState: useStateL } = React;

function Login({ login, nav }) {
  const Icon = window.Icon;
  const [email, setEmail] = useStateL('jiwoo@devticket.kr');
  const [password, setPassword] = useStateL('••••••••');
  const [err, setErr] = useStateL('');
  const [loading, setLoading] = useStateL(false);

  const submit = e => {
    e?.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) { setErr('올바른 이메일 형식이 아닙니다'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); login(email.split('@')[0]); }, 500);
  };

  return (
    <div className="editor-scroll">
      <div className="gutter">
        {Array.from({ length: 40 }, (_, i) => <span key={i} className="ln">{i + 1}</span>)}
      </div>
      <div className="editor-body" style={{ maxWidth: 460, margin: '40px auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <span style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--brand)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
            }}>DT</span>
            <span style={{ fontFamily: 'var(--font)', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>DevTicket</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font)', fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>로그인</h1>
          <p style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text-3)' }}>계정에 로그인하여 티켓을 관리하세요</p>
        </div>

        <div className="flat-card" style={{ padding: 28 }}>
          <form onSubmit={submit}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelS}>이메일</label>
              <input type="email" value={email}
                onChange={e => { setEmail(e.target.value); setErr(''); }}
                placeholder="you@example.com"
                style={{ ...inputS, borderColor: err ? 'var(--danger)' : 'var(--border-2)' }} />
              {err && <div style={{ marginTop: 6, fontFamily: 'var(--font)', fontSize: 12, color: 'var(--danger)' }}>× {err}</div>}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelS}>비밀번호</label>
              <input type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputS} />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ fontFamily: 'var(--font)', fontSize: 14 }}>
              {loading ? (
                <><span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>◐</span> 로그인 중...</>
              ) : '로그인'}
            </button>
          </form>

          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center', fontFamily: 'var(--font)', fontSize: 13.5, color: 'var(--text-3)' }}>
            아직 계정이 없으신가요?{' '}
            <a onClick={() => login('new_user')} style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}>회원가입</a>
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

const labelS = { display: 'block', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 };
const inputS = {
  width: '100%', height: 42, padding: '0 14px',
  background: 'var(--editor-bg)',
  border: '1px solid var(--border-2)', borderRadius: 8,
  fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)',
  transition: 'border-color 0.12s, box-shadow 0.12s',
};

window.Login = Login;
