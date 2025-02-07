export const getTokenData = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.userId,
      isPro: payload.isPro,
      exp: payload.exp
    };
  } catch (error) {
    console.error('Token parse error:', error);
    return null;
  }
};

export const isTokenValid = () => {
  const data = getTokenData();
  if (!data) return false;
  return data.exp * 1000 > Date.now();
}; 