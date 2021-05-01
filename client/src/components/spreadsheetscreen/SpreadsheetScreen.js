import SpreadsheetContents 				from './SpreadsheetContents'
import * as mutations 					from '../../cache/mutations';
import { GET_DB_REGIONS } 				from '../../cache/queries';
import React, { useState } 				from 'react';
import { useMutation, useQuery } 		from '@apollo/client';
import { WLayout, WLMain, WButton } from 'wt-frontend';

import { useHistory } from 'react-router-dom';

const SpreadsheetScreen = (props) => {

	const auth = props.user === null ? false : true;
	let regions = [];
	let RegionTableData = [];
    let pathname = useHistory().location.pathname;
    let theParentId = pathname.substring(13, pathname.length);
	let selectedMapName = "";

	const { loading, error, data, refetch } = useQuery(GET_DB_REGIONS);

	if(loading) { console.log(loading, 'loading'); }
	if(error) { console.log(error, 'error'); }
	if(data) { 
		// Assign todolists 
		for(let region of data.getAllRegions) {
			if(region.parentId == theParentId) {
				regions.push(region)
			}
			if(region._id == theParentId) {
				selectedMapName = region.name;
			}
		}
		// create data for sidebar links
		for(let region of regions) {
			if(region) {
				RegionTableData.push({
					_id: region._id, 
					name: region.name, 
					capital: region.capital, 
					leader: region.leader,
					landmarks: region.landmarks
				});
			}	
		}
		refetch();
	}

	const mutationOptions = {
		refetchQueries: [{ query: GET_DB_REGIONS }], 
		awaitRefetchQueries: true,
		onCompleted: () => refetch()
	}

	const [AddRegion] 			= useMutation(mutations.ADD_REGION, mutationOptions);
	const [UpdateRegionField] 	= useMutation(mutations.UPDATE_REGION_FIELD, mutationOptions);
	const [DeleteRegion]		= useMutation(mutations.DELETE_REGION, mutationOptions);

	const createNewRegion = async () => {
		let newRegion = {
			_id: '',
        	parentId: theParentId,
			name: 'undefined',
			owner: props.user._id,
        	capital: 'capital',
			leader: 'leader',
        	landmarks: ["landmark"]
		}
		const { data } = await AddRegion({ variables: { region: newRegion }, refetchQueries: [{ query: GET_DB_REGIONS }] });
		if(data) {
			// loadTodoList(data.addTodolist);
		} 	
	};

	const updateRegionField = async (_id, field, value) => {
		const { data } = await UpdateRegionField({ variables: { _id: _id, field: field, value: value }});
	};

	const deleteRegion = async (_id) => {
		DeleteRegion({ variables: { _id: _id }, refetchQueries: [{ query: GET_DB_REGIONS }] });
	};


	return (
		<WLayout wLayout="lside-rside">
			<WLMain w="30">
                <SpreadsheetContents auth={auth} listIDs={RegionTableData} selectedMapName={selectedMapName}
					createNewRegion={createNewRegion} updateRegionField={updateRegionField} deleteRegion={deleteRegion}/>
				<WButton onClick={createNewRegion}>createNewRegion</WButton>
			</WLMain>
		</WLayout>
	);
};

export default SpreadsheetScreen;