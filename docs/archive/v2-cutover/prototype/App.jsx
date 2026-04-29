// DevTicket — main app with theme (light/dark), cart state, routing.

const { useState: useStateA, useEffect: useEffectA } = React;

function App() {
  const [route, setRoute] = useStateA({ name: 'home' });
  const [isLoggedIn, setLoggedIn] = useStateA(false);
  const [user, setUser] = useStateA(null);
  const [cart, setCart] = useStateA([]);
  const [theme, setTheme] = useStateA(() => {
    try { return localStorage.getItem('dt-theme') || 'light'; } catch (e) { return 'light'; }
  });

  useEffectA(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('dt-theme', theme); } catch (e) {}
  }, [theme]);

  const nav = (name, params) => setRoute({ name, params });
  const login = (nickname) => { setLoggedIn(true); setUser({ nickname }); nav('events'); };
  const logout = () => { setLoggedIn(false); setUser(null); setCart([]); nav('events'); };
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const addToCart = (event, qty) => {
    setCart(xs => {
      const existing = xs.find(x => x.eventId === event.eventId);
      if (existing) return xs.map(x => x.eventId === event.eventId ? { ...x, qty: x.qty + qty } : x);
      return [...xs, { eventId: event.eventId, title: event.title, qty, price: event.price, date: window.fmtDate(event.eventDateTime) }];
    });
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const ctx = { isLoggedIn, user, nav, login, logout, route: route.name };

  let page;
  if (route.name === 'home')         page = <window.Landing nav={nav} />;
  else if (route.name === 'events')  page = <window.EventList nav={nav} />;
  else if (route.name === 'detail')  page = <window.EventDetail id={route.params?.id} nav={nav} isLoggedIn={isLoggedIn} addToCart={addToCart} />;
  else if (route.name === 'login')   page = <window.Login login={login} nav={nav} />;
  else if (route.name === 'cart')    page = <window.Cart nav={nav} cart={cart} setCart={setCart} />;
  else if (route.name === 'mypage')  page = <window.MyPage user={user} nav={nav} />;
  else                               page = <window.Landing nav={nav} />;

  return (
    <window.Layout {...ctx} cartCount={cartCount} theme={theme} onToggleTheme={toggleTheme}>
      {page}
    </window.Layout>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
