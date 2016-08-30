class Helper {

  static isThisMyThreadId(me, thread_id) {
    /*
      Accepts: 1 thread ID
      Returns: (boolean) true or false, do I have permission to view this thread ID
     */
    console.log('is this my thread id? ...');
    first_user_id = thread_id.split('_')[0];
    second_user_id = thread_id.split('_')[1];
    if (first_user_id === me.user_id || second_user_id === me.user_id)  {
      console.log('this is my thread');
      return true;
    } else {
      console.log('this is not my thread');
      return false;
    }  
  }

  static getPartnerFromThreadId(me, thread_id) {
    first_user_id = thread_id.split('_')[0];
    second_user_id = thread_id.split('_')[1];
    if (first_user_id === me.user_id)  {
      return second_user_id;
    } else {
      return first_user_id;
    }
  }

  static mkThreadId(me, to_user_id) {
    var from_user_id = me.user_id;
    /*
    Function: assemble thread ID
    Accepts: 2 user IDs ("from" user and "to" user)
    Returns: one thread ID, a merged combination of the 2 user IDs passed in

    WARNING IMPORTANT CRUCIAL PAY ATTENTION:
    This must *ALWAYS* be constructed by sorting ascending alphanumeric order (0-1A-Za-z).
    E.g., if users 818aldldf8a83819 and acczz6z555z are talking, the thread id would be '818aldldf8a83819_acczz6z555z'.
    To do otherwise will cause thread fragmentation. Kthx :)
     */
    /*
    Example: 
    ["405ec4d48ae14b2da1c7b461b59b2c62", "a060a8da26e546f9a590af38646d893e", "3ce12196cba745c4ae97e36f25dfb71e", "0f3ca38a2c3545e08dff9fa0d5e30d21", "b79293693a7f48228cf8972d6ee3d14d"]
    will become
    ["0f3ca38a2c3545e08dff9fa0d5e30d21", "3ce12196cba745c4ae97e36f25dfb71e", "405ec4d48ae14b2da1c7b461b59b2c62", "a060a8da26e546f9a590af38646d893e", "b79293693a7f48228cf8972d6ee3d14d"]
     */
    var users = new Array(from_user_id, to_user_id); // doesnt matter what order these are passed in, since were sorting
    users.sort(function(a, b){
      if(a < b) return -1;
      if(a > b) return 1;
      return 0;
    })
    var thread_id = users[0] + "_" + users[1]; // ex result: 405ec4d48ae14b2da1c7b461b59b2c62_b79293693a7f48228cf8972d6ee3d14d
    return thread_id;
  }
}

export default Helper;
