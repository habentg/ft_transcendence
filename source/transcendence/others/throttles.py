from rest_framework.throttling import SimpleRateThrottle

class TwoFactorSetUpThrottle(SimpleRateThrottle):
    scope = '2fa_throttle'
    def get_cache_key(self, request, view):
        # Use the client's IP address as the key for unauthenticated users
        return self.get_ident(request)

class PasswordUpdateThrottle(SimpleRateThrottle):
    scope = 'password_updateing_throttle'
    def get_cache_key(self, request, view):
        # Use the client's IP address as the key for unauthenticated users
        return self.get_ident(request)