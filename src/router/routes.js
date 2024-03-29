const routes = [{
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/IndexPage.vue')
    }]
  },

  {
    path: '/master-overview',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/Master.vue')
    }],
    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/master-2',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/MasterNew.vue')
    }],
    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/master-supa',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/MasterSupa.vue')
    }],
    // meta: {
    //   requiresAuth: true
    // }
  },

  {
    path: '/phonemes',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/Phonemes.vue')
    }],
    // meta: {
    //   requiresAuth: true
    // }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
