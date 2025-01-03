# Generated by Django 3.2.18 on 2024-02-20 03:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wms', '0007_rename_datasaver_parametersave'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tiger_GoodsReceive',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('idmainfromwms', models.CharField(db_collation='Thai_CI_AS', max_length=50)),
                ('usermachine', models.CharField(db_collation='Thai_CI_AS', max_length=50)),
                ('matno', models.CharField(db_collation='Thai_CI_AS', max_length=50)),
                ('matname', models.CharField(db_collation='Thai_CI_AS', max_length=100)),
                ('qty', models.IntegerField(blank=True, null=True)),
                ('gdate', models.DateField()),
                ('shift', models.CharField(db_collation='Thai_CI_AS', max_length=1)),
                ('machine', models.CharField(db_collation='Thai_CI_AS', max_length=3)),
                ('typeproduct', models.CharField(db_collation='Thai_CI_AS', max_length=3)),
                ('qtyw', models.IntegerField(blank=True, null=True)),
                ('qtye', models.IntegerField(blank=True, null=True)),
                ('typez', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('dateproductionz', models.DateField(blank=True, null=True)),
                ('shiftproductionz', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('month', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=2, null=True)),
                ('pallet', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('ton', models.DecimalField(blank=True, decimal_places=2, max_digits=18, null=True)),
                ('batch', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('approver', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('datetimewmssend', models.DateTimeField()),
                ('tigerpart', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('status', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('datesapgr', models.DateField(blank=True, null=True)),
                ('timesapgr', models.TimeField(blank=True, null=True)),
                ('matdocgr', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('statuslab', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
            ],
            options={
                'db_table': 'tiger_goodsreceive',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Tiger_GoodsReturn',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('idmainfromwms', models.CharField(db_collation='Thai_CI_AS', max_length=50)),
                ('usermachine', models.CharField(db_collation='Thai_CI_AS', max_length=50)),
                ('machine', models.CharField(db_collation='Thai_CI_AS', max_length=50)),
                ('datereturn', models.DateField()),
                ('shiftreturn', models.CharField(db_collation='Thai_CI_AS', max_length=1)),
                ('matno', models.CharField(db_collation='Thai_CI_AS', max_length=50)),
                ('matname', models.CharField(db_collation='Thai_CI_AS', max_length=50)),
                ('qtyreturn', models.IntegerField()),
                ('pallet', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('ton', models.DecimalField(blank=True, decimal_places=2, max_digits=18, null=True)),
                ('batch', models.CharField(db_collation='Thai_CI_AS', max_length=9)),
                ('typereturn', models.CharField(db_collation='Thai_CI_AS', max_length=4)),
                ('notereturn', models.CharField(db_collation='Thai_CI_AS', max_length=100)),
                ('approver', models.CharField(db_collation='Thai_CI_AS', max_length=50)),
                ('datetimewmssend', models.DateTimeField()),
                ('tigerpart', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('status', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('datesapreturn', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('timesapreturn', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('matdocreturn', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
            ],
            options={
                'db_table': 'tiger_goodsreturn',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Tiger_LockPallet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('id_tiger_goodsreceive', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('id_bifrost_goodsreceive', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('matno', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('matname', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=100, null=True)),
                ('dateproductionz', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('shiftproductionz', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=1, null=True)),
                ('machine', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=3, null=True)),
                ('datelock', models.DateField(blank=True, null=True)),
                ('qtylock', models.IntegerField(blank=True, null=True)),
                ('notelock', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=100, null=True)),
                ('statuslock', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('numberpallet01', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet02', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet03', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet04', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet05', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet06', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet07', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet08', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet09', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet10', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet11', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet12', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet13', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet14', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet15', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet16', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet17', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet18', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet19', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet20', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet21', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet22', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet23', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet24', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet25', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet26', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet27', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet28', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet29', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet30', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet31', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet32', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet33', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet34', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet35', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet36', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet37', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet38', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet39', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet40', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet41', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet42', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet43', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet44', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet45', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet46', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet47', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet48', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet49', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet50', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet51', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet52', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet53', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet54', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet55', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet56', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet57', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet58', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet59', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet60', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet61', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet62', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet63', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet64', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet65', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet66', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet67', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet68', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet69', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet70', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet71', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet72', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet73', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet74', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet75', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet76', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet77', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet78', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet79', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet80', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet81', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet82', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet83', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet84', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet85', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet86', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet87', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet88', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet89', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet90', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet91', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet92', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet93', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet94', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet95', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet96', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet97', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet98', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
                ('numberpallet99', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=10, null=True)),
            ],
            options={
                'db_table': 'tiger_lockpallet',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Tiger_StockBalance',
            fields=[
                ('zca', models.CharField(db_collation='Thai_CI_AS', max_length=50, primary_key=True, serialize=False)),
                ('urstock', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('block', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('qi', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('datetimeupdate', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'db_table': 'tiger_stockbalance',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='TigerGoodsIssue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('idmainfromwms', models.CharField(db_collation='Thai_CI_AS', max_length=50)),
                ('usermachine', models.CharField(db_collation='Thai_CI_AS', max_length=50)),
                ('machine', models.CharField(db_collation='Thai_CI_AS', max_length=3)),
                ('gdate', models.DateField()),
                ('shift', models.CharField(db_collation='Thai_CI_AS', max_length=1)),
                ('matno', models.CharField(db_collation='Thai_CI_AS', max_length=50)),
                ('matname', models.CharField(db_collation='Thai_CI_AS', max_length=100)),
                ('qty', models.IntegerField()),
                ('pallet', models.CharField(db_collation='Thai_CI_AS', max_length=10)),
                ('ton', models.DecimalField(decimal_places=2, max_digits=18)),
                ('urinsert', models.IntegerField()),
                ('blockinsert', models.IntegerField()),
                ('approver', models.CharField(db_collation='Thai_CI_AS', max_length=50)),
                ('datetimewmssend', models.DateTimeField()),
                ('tigerpart', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('status', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('datesapgi', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
                ('timesapgi', models.TimeField(blank=True, null=True)),
                ('matdocgi', models.CharField(blank=True, db_collation='Thai_CI_AS', max_length=50, null=True)),
            ],
            options={
                'db_table': 'tiger_goodsissue',
                'managed': False,
            },
        ),
        migrations.DeleteModel(
            name='GoodsReceiveToTiger',
        ),
        migrations.DeleteModel(
            name='LockTiger',
        ),
        migrations.DeleteModel(
            name='Stockbalancetiger',
        ),
        migrations.AddField(
            model_name='map_management',
            name='kgpcs',
            field=models.FloatField(blank=True, null=True),
        ),
    ]
