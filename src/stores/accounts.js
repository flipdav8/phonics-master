import {
  defineStore
} from 'pinia';



export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    showDialog: false, //for accounts login

    subscription: null,
    accountSettings: null,
    syncdb: null,
    currentUser: null,
    userPrompts: null,
    socketStatus: null,
    syncState: null,
    invites: null,
    roles: null,

    view_as: null,
    view_student: null,
    userType: 'teacher', //parent
    useTypeOptions: [{
        label: 'Teacher',
        value: 'teacher'
      },
      {
        label: 'Parent/Guardian',
        value: 'guardian'
      },
    ],

    remote_mode: false,
    classroom_mode: false,
    classroom_locked: false,
    classroom_pin: '',

  }),
  getters: {
    //
  },
  actions: {
    setClassroomMode() {
      // console.log('classroom mode set');
      localStorage.setItem("classroom_mode", this.classroom_mode);
      localStorage.removeItem("view_as");
      this.view_as = null;
      this.view_student = null;
    }
  },
});
