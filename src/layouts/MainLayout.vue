<template>
    <q-layout view="lHh Lpr lFf">
        <q-header elevated class="q-py-sm bg-primary">
            <q-toolbar>
                <q-avatar>
                    <q-icon size="md" name="mdi-state-machine"></q-icon>
                </q-avatar>
                <q-toolbar-title> FA Graphs </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script setup lang="ts"></script>
