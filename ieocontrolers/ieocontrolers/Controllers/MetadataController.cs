using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.ComponentModel.DataAnnotations;
using WebApplication4.Models;

namespace WebApplication4.Models
{
    [MetadataType(typeof(MetadataProjects))]
    public partial class Projects
    {
        class MetadataProjects
        {
            [Display(Name ="Proyecto")]
            public string project { get; set; }
            public int id { get; set; }
       

         //   [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
          //  public virtual ICollection<User_Prj_Role> User_Prj_Role { get; set; }


        }
    }
}