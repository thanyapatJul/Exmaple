from rest_framework import permissions

class AdminPerm(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated and (user.role_id == 1):
            return True
        return False
    
class PlannerPerm(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated and (user.role_id == 2):
            return True
        return False
    
class ProductionPerm(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated and (user.role_id == 3):
            return True
        return False
    
class PlantCoPerm(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated and (user.role_id == 4):
            return True
        return False
    
class LabPerm(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated and (user.role_id == 5):
            return True
        return False
    
class ScmPerm(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated and (user.role_id == 6):
            return True
        return False
    
class ManagerPerm(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated and (user.role_id == 7):
            return True
        return False
    
class PISPerm(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated and (user.role_id == 8):
            return True
        return False
