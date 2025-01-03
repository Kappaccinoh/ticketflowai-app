# Generated by Django 5.1.4 on 2024-12-25 11:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='ticket',
            options={},
        ),
        migrations.RemoveField(
            model_name='ticket',
            name='estimate',
        ),
        migrations.AddField(
            model_name='ticket',
            name='estimated_hours',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='ticket',
            name='priority',
            field=models.CharField(choices=[('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High')], default='MEDIUM', max_length=10),
        ),
        migrations.AlterField(
            model_name='ticket',
            name='status',
            field=models.CharField(choices=[('PENDING', 'Pending'), ('IN_PROGRESS', 'In Progress'), ('COMPLETED', 'Completed')], default='PENDING', max_length=20),
        ),
    ]