import React, { useEffect, useState } from "react";
import { Button } from '@innovation/nova'
import styled, { css } from 'styled-components'
import { api } from '../../common/api';
import AriaTextField from "../AriaTextField";
import AriaSelect from "../AriaSelect";
import CustomRadio from "../CustomRadio";
import VerticalRadioGroup from "../VerticalRadioGroup";
import {Item} from '@react-stately/collections';
import moment from 'moment';
import { useHistory } from "react-router-dom";

const SubmitButton = styled(Button) ({
    textTransform: 'none',
    "&:disabled": {
        backgroundColor: '#89B5E5'
    },
    "&:enabled": {
        backgroundColor: '#006FE7'
    },
    fontSize: '14px',
    marginTop: '20px'
});


const cancelButtonCss = css`
    background: ${props => props.theme.colors.white};
    color: ${props => props.theme.colors.gray90};
    transition: .1s background ease;

    : hover {
        background: ${props => props.theme.colors.gray20};
    }
`

const ButtonRow = styled.div`
    display: flex;
    justify-content: flex-end;
`

const DATE_RANGES = [
    {key: 'date_range_today', name: 'Today'},
    {key: 'date_range_yesterday', name: 'Yesterday'},
    {key: 'date_range_in_the_past_week', name: 'In the past week'},
    {key: 'date_range_in_the_past_month', name: 'In the past month'},
    {key: 'date_range_in_the_past_year', name: 'In the past year'}
]

const SEARCH_SCOPES = [
    {key: 'allEvaluations', name: 'All Evaluations'},
    {key: 'myEvaluations', name: 'My Evaluations'},
    {key: 'myCalibrations', name: 'My Pending Calibrations'}
]

const EVAL_STATE = [
    {key: 'unscored', name: 'Unscored'},
    {key: 'scored', name: 'Scored'},
    {key: 'in_progress', name: 'In Progress'},
    {key: 'needs_approval', name: 'Needs Approval'},
    {key: 'cannot_score', name: 'Cannot Score'},
    {key: 'needs_cannot_score_approval', name: 'Needs Cannot Score Approval'}
]

export default function Filters(props) {

    const { setContacts, setShowSpinner, getContactIdCallback, getSelectedDateRangeCallback, getPhoneNumberCallback, getSelectedSearchScopeCallback, getSelectedEvalStateCallback, getDurationInSecondsCallback, getResultsCallback, getEvaluatorFirstNameCallback, getEvaluatorLastNameCallback } = props

    const [savedFilters, setSavedFilters] = useState([])
    const [selectedDateRange, setSelectedDateRange] = useState('')
    const [selectedFilter, setSelectedFilter] = useState('')
    const [contactId, setContactId] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [selectedSearchScope, setSelectedSearchScope] = useState('')
    const [selectedEvalState, setSelectedEvalState] = useState('')
    const history = useHistory();

    const [selectedGroup, setSelectedGroup] = useState('')
    const [allGroups, setAllGroups] = useState([])
    const [selectedTeam, setSelectedTeam] = useState('')
    const [allTeams, setAllTeams] = useState([])
    const [allSelectableTeams, setAllSelectableTeams] = useState([])
    const [selectedAgent, setSelectedAgent] = useState('')
    const [allAgents, setAllAgents] = useState([])
    const [allSelectableAgents, setAllSelectableAgents] = useState([])
    const [durationInSeconds, setDurationInSeconds] = useState('')
    const [evaluatorFirstName, setEvaluatorFirstName] = useState('')
    const [evaluatorLastName, setEvaluatorLastName] = useState('')

    
    useEffect(() => {
        getContactIdCallback(contactId)
        getSelectedDateRangeCallback(selectedDateRange)
        getPhoneNumberCallback(phoneNumber)
        getSelectedSearchScopeCallback(selectedSearchScope)
        getSelectedEvalStateCallback(selectedEvalState)
        getDurationInSecondsCallback(durationInSeconds)
        getEvaluatorFirstNameCallback(evaluatorFirstName)
        getEvaluatorLastNameCallback(evaluatorLastName)

    },[contactId, selectedDateRange, phoneNumber, selectedSearchScope, selectedEvalState,durationInSeconds, evaluatorFirstName, evaluatorLastName])


    // fetch list of user's Saved Filters from Calabrio ONE
    async function fetchSavedFilters() {
        const response = await api('/api/ace/get_saved_filters')
        return response.data.filters.searches
    }

    // fetch details on filter
    async function getFilter(key) {
        const response = await api(`/api/ace/get_filter?key=${key}`)
        return response.data.filters
    }

    // fetch groups&teams from Calabrio ONE
    async function fetchOrg() {
        const response = await api('/api/ace/get_org')
        return response.data
    }

    // get most recent search
    async function getMostRecentSearch() {
        const response = await api(`/api/ace/recent_contact_search`)
        return response.data
    }

    // save most recent search
    async function saveMostRecentSearch() {
        let data = {}
    
        if (!isNaN(contactId) && Number(contactId) > 0) {
            data.contactId = Number(contactId);
        } else {
            data.range = selectedDateRange;
        }
        
        if (phoneNumber) {
            data.phoneNumber = phoneNumber;
        }

        if (selectedSearchScope) {
            data.searchScope = selectedSearchScope
        }

        if (selectedEvalState) {
            data.evalState = selectedEvalState
        }
        if (selectedGroup) {
            data.group = selectedGroup;
        }

        if (selectedTeam) {
            data.team = selectedTeam;
        }

        if (selectedAgent) {
            data.agent = selectedAgent;
        }
        if (durationInSeconds) {
            data.durationInSeconds = durationInSeconds;
        }

        if (evaluatorFirstName) {
            data.evaluatorFirstName = evaluatorFirstName;
        }

        if (evaluatorLastName) {
            data.evaluatorLastName = evaluatorLastName;
        }

        const response = await api.post(`/api/ace/recent_contact_search`, data)
        return response.data
    }


    // get contacts
    async function getContacts() {
        let params = "";

        // Either duration or contact id must be specified
        if ((isNaN(contactId) || Number(contactId) <= 0) && !selectedDateRange) {
            alert("Either date range or contact id must be specified");
            return;
        }

        if (!isNaN(contactId) && Number(contactId) > 0) {
            params = `contactId=${contactId}`;
        } else {
            params = `range=${selectedDateRange}`;
        }
        
        // At this point we should have contact id or date range in params.. so no need to check if populated
        
        if (phoneNumber) {
            params = `${params}&phoneNumber=${phoneNumber}`;
        }

        if (selectedSearchScope) {
            params = `${params}&searchScope=${selectedSearchScope}`;
        }

        if (selectedEvalState) {
            params = `${params}&evalState=${selectedEvalState}`;
        }
        if (selectedGroup) {
            params = `${params}&group=${selectedGroup}`;
        }

        if (selectedTeam) {
            params = `${params}&team=${selectedTeam}`;
        }

        if (selectedAgent) {
            params = `${params}&agent=${selectedAgent}`;
        }
        if (durationInSeconds) {
            params = `${params}&expr=duration~lessThan~${durationInSeconds}`;
        }

        if (evaluatorFirstName) {
            params = `${params}&evaluatorFirstName=${evaluatorFirstName}`;
        }
        if (evaluatorLastName) {
            params = `${params}&evaluatorLastName=${evaluatorLastName}`;
        }

        return getContactsApi(params);
    }

    // get contacts API calls
    async function getContactsApi(params) {
        console.log(`Querying for contacts params : ${params}`)
        const response = await api.post(`/api/ace/get_contacts`, {"count_max": 49, "count_min": 0, "params" : params})
        return response.data.contacts
    }

     //get teams based on the group we selected
     async function getTeam(){
        const teams = []
        allTeams.forEach(element=>{
            //get teams based on the group or select all groups or select all teams
            if(element.parentGroupId==selectedGroup || selectedGroup=='' || element.id==''){
                teams.push(element)
            }
        })
        setAllSelectableTeams(teams)
    
    }
    //get teams based on the group we selected
    useEffect(()=>{
        getTeam()
    },[selectedGroup])

    //get agents based on the teams we selected
    async function getAgent(){
        const agents = []
        allAgents.forEach(element=>{
            //get agents based on the team or select all teams or selesct all agents
            if(element.groupId==selectedTeam || selectedTeam=='' || element.id==''){
                agents.push(element)
            }
        })
        setAllSelectableAgents(agents)
    
    }
    //get teams based on the group we selected
    useEffect(()=>{
        getAgent()
    },[selectedTeam])

    // get data from Calabrio One
    async function getInitialDataFromCalabrioOne() {

        const filters = await fetchSavedFilters();
        if (filters) {
            filters.sort((current, next) => current.name.localeCompare(next.name))
            setSavedFilters(filters)
        }

        const org = await fetchOrg();
        console.log(org)
        let groups = [{name: 'All', id: '', groupId: '', parentGroupId: 1, productivityCompilation: false, active: true}]
        if (org.groups) {
            org.groups.sort((current, next) => current.name.localeCompare(next.name))
            setAllGroups([...groups,...org.groups])
        }
        let teams = [{name: "All",id: '',acdId: null,acdServerId: 0,acdServerName: null,groupId: 0,parentGroupId: 0,productivityCompilation: true,isSynchronized: false,active: true,activated: ''}];
        
        if (org.teams) {
            org.teams.sort((current, next) => current.name.localeCompare(next.name))
            setAllTeams([...teams,...org.teams])
            setAllSelectableTeams([...teams,...org.teams])
        }

        let agents = [{id: '',acdId: null,firstName: null,lastName: "",email: null,displayId: "All",activated: '',deactivated: '',groupId: '',timeZone: '',isSynchronized: false,isReconcileOnly: false}]
        
        if (org.agents) {
            org.agents.sort(((current, next) => current.displayId.localeCompare(next.displayId)))
            setAllAgents([...agents,...org.agents])
            setAllSelectableAgents([...agents,...org.agents])
        }
        const lastSearch = await getMostRecentSearch();
        if (lastSearch) {
            if (lastSearch.contactId) {
                setContactId(lastSearch.contactId)
            }
            if (lastSearch.range) {
                setSelectedDateRange(lastSearch.range)
            }
            if (lastSearch.phoneNumber) {
                setPhoneNumber(lastSearch.phoneNumber)
            }
            if (lastSearch.searchScope) {
                setSelectedSearchScope(lastSearch.searchScope)
            }
            if (lastSearch.evalState) {
                setSelectedEvalState(lastSearch.evalState)
            }
            if (lastSearch.group) {
                setSelectedGroup(lastSearch.group)
            }
            if (lastSearch.team) {
                setSelectedTeam(lastSearch.team)
            }
            if (lastSearch.agent) {
                setSelectedAgent(lastSearch.agent)
            }
            if (lastSearch.durationInSeconds) {
                setDurationInSeconds(lastSearch.durationInSeconds)
            }
            if (lastSearch.evaluatorFirstName) {
                setEvaluatorFirstName(lastSearch.evaluatorFirstName)
            }
            if (lastSearch.evaluatorLastName) {
                setEvaluatorLastName(lastSearch.evaluatorLastName)
            }

            let params = ""
            for (const entry of Object.entries(lastSearch)) {
                console.log(`${entry[0]} = ${entry[1]}`)
                params = `${entry[0]}=${entry[1]}&${params}`
            }
            const rawContacts = await getContactsApi(params)
            if (rawContacts) {
                processContacts(rawContacts);
            }
            const rawContactsCount = await getContactsApi(params + 'searchStats=true')
            if (rawContactsCount) {
                getResultsCallback(rawContactsCount.count);
            }
        }
    }

    // Get data from Calabrio One
    useEffect(() => {
        setShowSpinner(true);
        getInitialDataFromCalabrioOne()
        .then(() => {
            console.log("Done fetching data from Calabrio One")
        })
        .catch(
            error => {
                const { response: { status } } = error;
                if (status == 401) {
                    history.push('/ace/nouserinsession')
                } else {
                    alert("Could not get data from Calabrio ONE. If you continue to encounter this error please contact your system administrator");
                }
            }   
        )
        .finally(() => {
            setShowSpinner(false);
        });
    }, []);


    function onSelectSavedFilter(key) {

        // TODO setShowSpinner(true);

        resetFields();
        const filter = savedFilters.find(f => f.key == key)
        getFilter(key)
        .then(
            filter => {
                if (filter.contactId) {
                    setContactId(filter.contactId);
                }
                if (filter.range) {
                    setSelectedDateRange(filter.range);
                }
                if (filter.phoneNumber) {
                    setPhoneNumber(filter.phoneNumber);
                }
                if (filter.searchScope) {
                    setSelectedSearchScope(filter.searchScope);
                }
                if (filter.evalState) {
                    setSelectedEvalState(filter.evalState);
                }
                if (filter.group) {
                    setSelectedGroup(filter.group);
                }
                if (filter.team) {
                    setSelectedTeam(filter.team);
                }
                if (filter.agent) {
                    setSelectedAgent(filter.agent);
                }
                if (filter.durationInSeconds) {
                    setDurationInSeconds(filter.durationInSeconds);
                }
                if (filter.evaluatorFirstName) {
                    setEvaluatorFirstName(filter.evaluatorFirstName);
                }
                if (filter.evaluatorLastName) {
                    setEvaluatorLastName(filter.evaluatorLastName);
                }
                // TODO 
            }
        )
        .catch(
            error => {
                const { response: { status } } = error;
                if (status == 401) {
                    history.push('/ace/nouserinsession')
                } else {
                    alert("Could not get filter from Calabrio ONE. If you continue to encounter this error please contact your system administrator");
                }
            }
        )
        .finally(() => {
            // TODO setShowSpinner(false);
        });

        setSelectedFilter(filter);        
    }
 
    function getEvalState(state) {
        return EVAL_STATE[state].name
    }

    
    async function getResults() {
        let params = "";
        if (selectedDateRange) {
            params = `${params ? params + '&' : ''}range=${selectedDateRange}`;
        }

        if (contactId) {
            params = `${params ? params + '&' : ''}contactId=${contactId}`;
        }
        
        if (phoneNumber) {
            params = `${params}&phoneNumber=${phoneNumber}`;
        }

        if (selectedGroup) {
            params = `${params}&group=${selectedGroup}`;
        }

        if (selectedTeam) {
            params = `${params}&team=${selectedTeam}`;
        }

        if (selectedAgent) {
            params = `${params}&agent=${selectedAgent}`;
        }
        if (durationInSeconds) {
            params = `${params}&expr=duration~lessThan~${durationInSeconds}`;
        }
        if (selectedSearchScope) {
            params = `${params}&searchScope=${selectedSearchScope}`;
        }
        if (selectedEvalState) {
            params = `${params}&evalState=${selectedEvalState}`;
        }
        if (evaluatorFirstName) {
            params = `${params}&evaluatorFirstName=${evaluatorFirstName}`;
        }

        if (evaluatorLastName) {
            params = `${params}&evaluatorLastName=${evaluatorLastName}`;
        }

        const rawContactsCount = await getContactsApi(params + '&searchStats=true')
        if (rawContactsCount) {
            getResultsCallback(rawContactsCount.count);
        }
    }

    function processContacts(rawContacts) {
        if (rawContacts) {
            const contacts = []
            rawContacts.map((c, index) => {
                const date = new Date(c.startTime);
                const dateString = date.toLocaleDateString();
                const timeString = date.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true})
                const durationStr = moment.utc(new Date(c.callDuration)).format('HH:mm:ss');
                contacts.push(
                    {
                        state: getEvalState(c.evalStateId),
                        id: c.id,
                        lastName: c.agent.lastName,
                        firstName: c.agent.firstName,
                        group: c.group.name,
                        team: c.team.name,
                        ani: c.ani,
                        dnis: c.dnis,
                        date: dateString,
                        time: timeString,
                        tz: c.tz,
                        callDuration: durationStr
                    }
                )
            })
            console.log(contacts);
            if (contacts) {
                setContacts(contacts)
            }
        }
    }

    function onApply(event) {

        // prevent submission of form
        event.preventDefault()

        setShowSpinner(true);

        getContacts()
        .then(
            rawContacts => {
                if (rawContacts) {
                    processContacts(rawContacts);
                }
                saveMostRecentSearch();
            },
            getResults()
        )
        .catch(
            error => {
                const { response: { status } } = error;
                if (status == 401) {
                    history.push('/ace/nouserinsession')
                } else {
                    alert("Could not get contacts from Calabrio ONE. If you continue to encounter this error please contact your system administrator");
                }
            }
        )
        .finally(() => {
            setShowSpinner(false);
        });
    };

    function onCancel() {
        setSelectedFilter('');
        resetFields();
    };

    function resetFields() {
        setSelectedDateRange('');
        setContactId('');
        setPhoneNumber('');
        setSelectedSearchScope('');
        setSelectedEvalState('');
        setSelectedGroup('');
        setSelectedTeam('');
        setSelectedAgent('')
        setDurationInSeconds('');
        setEvaluatorFirstName('');
        setEvaluatorLastName('');
    };


    return (
        <div>
            <form onSubmit={onApply} autoComplete="off">
                
                {/*
                <AriaSelect 
                    id="savedFilter"
                    label='Saved filter'
                    value={selectedFilter}
                    onSelectionChange={onSelectSavedFilter} 
                    selectedKey={selectedFilter}
                >  
                    {savedFilters.map((item,index)=>{
                        return <Item key={item.key}>{item.name}</Item>
                    })}
                </AriaSelect>
                */}

                <AriaSelect 
                    id="dateRange"
                    label='Date range'
                    value={selectedDateRange}
                    onSelectionChange={setSelectedDateRange} 
                    selectedKey={selectedDateRange}
                >  
                    {DATE_RANGES.map((item,index)=>{
                        return <Item key={item.key}>{item.name}</Item>
                    })}
                </AriaSelect>

                <AriaTextField 
                    id="contactId"
                    label='Contact ID'
                    value={contactId}
                    onChange={setContactId}
                />

                <AriaTextField 
                    id="phoneNumber"
                    label='Phone number'
                    value={phoneNumber}
                    onChange={setPhoneNumber} 
                />

                <AriaSelect 
                    id="searchScope"
                    label='Search scope'
                    value={selectedSearchScope}
                    onSelectionChange={setSelectedSearchScope} 
                    selectedKey={selectedSearchScope}
                >  
                    {SEARCH_SCOPES.map((item,index)=>{
                        return <Item key={item.key}>{item.name}</Item>
                    })}
                </AriaSelect>

                <AriaSelect 
                    id="state"
                    label='State'
                    value={selectedEvalState}
                    onSelectionChange={setSelectedEvalState} 
                    selectedKey={selectedEvalState}
                >  
                    {EVAL_STATE.map((item,index)=>{
                        return <Item key={item.key}>{item.name}</Item>
                    })}
                </AriaSelect>

                <AriaSelect 
                    id="group"
                    label='Group'
                    value={selectedGroup}
                    onSelectionChange={setSelectedGroup} 
                    selectedKey={selectedGroup}
                >  
                    {allGroups.map((item,index)=>{
                        return <Item key={item.id}>{item.name}</Item>
                    })}
                </AriaSelect>
               
                <AriaSelect 
                    id="team"
                    label='Team'
                    value={selectedTeam}
                    onSelectionChange={setSelectedTeam} 
                    selectedKey={selectedTeam}
                >  
                    {allSelectableTeams.map((item,index)=>{
                        return <Item key={item.id}>{item.name}</Item>
                    })}
                </AriaSelect>
                
                <AriaSelect 
                    id="agent"
                    label='Agent'
                    value={selectedAgent}
                    onSelectionChange={setSelectedAgent} 
                    selectedKey={selectedAgent}
                >  
                    {allSelectableAgents.map((item,index)=>{
                        return <Item key={item.id}>{item.displayId}</Item>
                    })}
                </AriaSelect>

                <AriaTextField 
                    id="durationInSeconds"
                    label='Seconds'
                    value={durationInSeconds}
                    onChange={setDurationInSeconds}
                />

                <AriaTextField 
                    id="evaluatorFirstName"
                    label='Evaluator first name'
                    value={evaluatorFirstName}
                    onChange={setEvaluatorFirstName} 
                />

                <AriaTextField 
                    id="evaluatorLastName"
                    label='Evaluator last name'
                    value={evaluatorLastName}
                    onChange={setEvaluatorLastName} 
                />


                
                <ButtonRow>
                    <SubmitButton
                        type="submit"
                        variant="contained"
                    >
                        Apply
                    </SubmitButton>
                    <Button
                        style={{ marginLeft: 14, marginTop: 20 }}
                        css={cancelButtonCss}
                        onClick={onCancel}
                        type="reset"
                    >
                        Cancel
                    </Button>
                </ButtonRow>
            </form>
        </div>
    )
}