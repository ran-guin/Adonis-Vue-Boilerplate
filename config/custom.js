module.exports = {
  invitation_required: false,
  loginRequired: false,
  lookup: {
    public: [
      'interests',
      'services',
      'goods'
    ],
    private: [
      'users'
    ]
  },
  payloadContent: {
   user: {
    userid: 'id',
    username: 'username',
    email: 'email',
    access: 'access',
    role: 'role',
    status: 'status',
    uuid: 'UUID'
   },
   login: {
    login_id: 'id',
    remoteAddress: 'ip'
   },
   settings: {
    latitude: 'latitude',
    longitude: 'longitude',
    mobility: 'range_in_km',
    access: 'access'
   },
   default: {
    role: 'User',
    uuid: 'tbd'
   }
  }

}
