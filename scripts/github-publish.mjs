/** Optional deployment helper. Uses the OS Git credential store in memory only. */
import { spawnSync } from 'node:child_process';
const owner='ValdemarNielsen',repository='social-graphs-interactive';
const credential=spawnSync('git',['credential','fill'],{input:`protocol=https\nhost=github.com\nusername=${owner}\n\n`,encoding:'utf8',env:{...process.env,GCM_INTERACTIVE:'never'}});
if(credential.status!==0)throw new Error('GitHub credentials unavailable in the OS credential store. Sign in to GitHub with Git Credential Manager first.');
const password=credential.stdout.split(/\r?\n/).find(line=>line.startsWith('password='))?.slice(9);
if(!password)throw new Error('No credential was returned.');
async function request(path,method='GET',body){
 const response=await fetch(`https://api.github.com${path}`,{method,headers:{Authorization:`Bearer ${password}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
 const data=response.status===204?{}:await response.json();
 if(!response.ok&&response.status!==404)throw new Error(`GitHub ${method} ${path}: HTTP ${response.status}: ${data.message??'request failed'}`);
 return {status:response.status,data};
}
const user=await request('/user');
if(user.data.login.toLowerCase()!==owner.toLowerCase())throw new Error('The authenticated GitHub account is not the requested owner.');
const mode=process.argv[2]??'status';
if(mode==='create'){
 const existing=await request(`/repos/${owner}/${repository}`);
 if(existing.status!==404)throw new Error('Repository already exists; refusing to modify it during creation.');
 const created=await request('/user/repos','POST',{name:repository,description:'An interactive field guide to DTU Social Graphs and Interactions (2026). Six chapters, exact browser experiments, and full source attribution.',private:false,auto_init:false,has_issues:true,has_projects:false,has_wiki:false});
 console.log(JSON.stringify({repository:created.data.html_url,created:created.status===201}));
}else if(mode==='pages'){
 const existing=await request(`/repos/${owner}/${repository}/pages`);
 const result=existing.status===404?await request(`/repos/${owner}/${repository}/pages`,'POST',{build_type:'workflow'}):existing;
 console.log(JSON.stringify({status:result.status,url:result.data.html_url,buildType:result.data.build_type}));
}else if(mode==='runs'){
 const result=await request(`/repos/${owner}/${repository}/actions/runs?per_page=3`);
 console.log(JSON.stringify(result.data.workflow_runs?.map(r=>({id:r.id,status:r.status,conclusion:r.conclusion,url:r.html_url,sha:r.head_sha}))));
}else if(mode==='dispatch'){
 await request(`/repos/${owner}/${repository}/actions/workflows/deploy.yml/dispatches`,'POST',{ref:'main'});console.log('Pages workflow requested.');
}else{
 const repo=await request(`/repos/${owner}/${repository}`);
 console.log(JSON.stringify({login:user.data.login,id:user.data.id,repositoryExists:repo.status!==404,repository:repo.data.html_url??null}));
}
