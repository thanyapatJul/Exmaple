# myapi/serializers.py
from rest_framework import serializers
from .models import *

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class UserRegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    role_id = serializers.IntegerField()


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('id','name',)



class map_management_serializer(serializers.ModelSerializer):
    product_name = serializers.StringRelatedField(source='product.name', read_only=True)

    class Meta:
        model = Map_management
        fields = '__all__'

class MapListFillPlanSerializer(serializers.ModelSerializer):

    class Meta:
        model = MapListFillPlan
        fields = '__all__' 
class MapListFillPalletSerializer(serializers.ModelSerializer):

    class Meta:
        model = MapListFillPallet
        fields = '__all__' 

class MapListWithdrawPlanSerializer(serializers.ModelSerializer):

    class Meta:
        model = MapListWithdrawPlan
        fields ='__all__'


class MapListWithdrawPalletSerializer(serializers.ModelSerializer):

    class Meta:
        model = MapListWithdrawPallet
        fields ='__all__'

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialModel
        fields = ['materialid', 'zca']

class MaterialProcessSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialProcess
        fields = ['parentid', 'childid']


class ProcessLockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessLock
        fields = '__all__'

class MasterwipstkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Masterwipstk
        fields = '__all__'  # or specify specific fields


class LockLabHSBoardDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = LockLabHSBoardData
        fields = '__all__'
        extra_kwargs = {field.name: {'required': False, 'allow_null': True} for field in model._meta.fields}