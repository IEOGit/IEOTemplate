//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace WebApplication4.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class User_Prj_Role
    {
        public int id_user { get; set; }
        public int id_project { get; set; }
        public int id_rol { get; set; }
        public int id { get; set; }
    
        public virtual Projects Projects { get; set; }
        public virtual Roles Roles { get; set; }
        public virtual Users Users { get; set; }
    }
}
