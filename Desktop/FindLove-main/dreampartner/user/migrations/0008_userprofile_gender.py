# Generated by Django 5.1.5 on 2025-02-06 18:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0007_userprofile_birthdate'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='gender',
            field=models.CharField(blank=True, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], max_length=10, null=True),
        ),
    ]
