const leadsModel = require('../../model/leadsModel');
const {Lead} = require('../../model/leadsModel');

const {ObjectId} = require('mongodb')


const addlead =  async (req_body) =>{

    // name, email, phone, location, field_visit_date, salesRep, last_visisted, site_state, walkin_status

    const {name, email, phone, location, field_visit_date, salesRep, last_visisted, site_state, walkin_status}  = req_body;
    const lead = new Lead({
        name: name,
        email: email,
        phone: phone,
        location: location,
        field_visit_date: field_visit_date,
        salesRep: salesRep,
        last_visisted: last_visisted,
        site_state: site_state,
        walkin_status: walkin_status
    });
    let savedLead = await lead.save();

    return { data: { lead: savedLead }, code: 200, error: "" }
}


const updateLead = async (fields, lead_id) =>{
    
    const updatedLead = await Lead.findOneAndUpdate(
        { _id:  lead_id},
        { $set: fields },
        { new: true } // Option to return the modified document
    );

    return { data: { lead: updatedLead }, code: 200, error: "" }

}


const deleteLead = async (id) =>{
    const deletedLead = await Lead.findByIdAndDelete(id);
    return { data: { lead: deletedLead }, code: 200, error: "" }
}


const fetchLeads = async (page, limit, filters) =>{

    let filter = filters ? filters : {};
    const limits = limit ? limit : 10; 
    const page_number = page ? page : 1;
    

    const lead = await Lead.find(filter).skip((page_number - 1) * limits).limit(parseInt(limits));;
    return { data: { lead: lead }, code: 200, error: "" }
}



const leadheaders = async() => {

    let group_clause = {
        $group: {
          _id: null,
          new: {
            $sum: {
              $cond: [{ $eq: ["$lead_status", "new"] }, 1, 0]
            }
          },
          in_progress: {
            $sum: {
              $cond: [{ $eq: ["$lead_status", "in_progress"] }, 1, 0]
            }
          },
          quotation_sent: {
            $sum: {
              $cond: [{ $eq: ["$lead_status", "quotation_sent"] }, 1, 0]
            }
          },
          qualifies: {
            $sum: {
              $cond: [{ $eq: ["$lead_status", "qualifies"] }, 1, 0]
            }
          },
          dropped: {
            $sum: {
              $cond: [{ $eq: ["$lead_status", "dropped"] }, 1, 0]
            }
          }
        }
    }

    let projections = {
        $project: {
          _id: 0,
          new: 1,
          in_progress: 1,
          quotation_sent: 1,
          qualifies: 1,
          dropped: 1
        }
    }


    const [leads_group] =  await Lead.aggregate([
        group_clause,
        projections
    ])

    console.log(leads_group)

    const total = await Lead.countDocuments();
    return { data: { leadheader: {...leads_group, total: total} } , code: 200, error: "" }
}

module.exports = {
    addlead: addlead, 
    updateLead: updateLead, 
    deleteLead: deleteLead,
    fetchLeads: fetchLeads,
    leadheaders: leadheaders
};