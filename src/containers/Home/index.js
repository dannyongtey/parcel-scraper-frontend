
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Input from 'components/Input'
import { loginUser, logoutUser } from 'containers/App/actions'
import { selectAuth } from 'containers/App/selectors'
import { GoogleLogin } from 'react-google-login';
import { showSnack } from 'react-redux-snackbar';
import request from 'utils/request'
import { confirmAlert } from 'react-confirm-alert';
import { askNotificationPermission } from 'utils/push-notifications'


export class Home extends PureComponent {
    static propTypes = {
        history: PropTypes.shape({
            push: PropTypes.func,
        }),
    }


    getParcels = async () => {
        try {
            const { data } = await request({
                type: 'post',
                url: ''
            })
            this.setState({
                data,
                filteredData: [...data],
                hasFetched: true
            })
        } catch (err) {
            if (!err.response) {
                this.props.showSnack('myErrorId', {
                    label: 'Server is currently under maintenance.',
                    timeout: 3000,
                    button: { label: 'Sorry!' }
                });
            } else {
                const { error } = err.response.data
                this.props.showSnack('myErrorId', {
                    label: error,
                    timeout: 3000,
                    button: { label: 'Sorry!' }
                });
            }
        }
    }

    getMessagingToken = async () => {
        if (!localStorage.getItem('notification-token')) {
            const token = await askNotificationPermission()
            return token
        } else {
            return localStorage.getItem('notification-token')
        }
    }

    submitRequest = async (type) => {
        let token = ''
        await new Promise((resolve, _) => {
            confirmAlert({
                title: 'Enable push notification?',
                message: 'This browser supports push notifications, do you want to enable it to receive notifications on your browser when your parcel has arrived? Note it does not affect the email messaging function.',
                buttons: [
                    {
                        label: 'Yes',
                        onClick: async () => {
                            token = await this.getMessagingToken()
                            resolve()
                        }
                    },
                    {
                        label: 'No',
                        onClick: () => { resolve() }
                    }
                ]
            });
        })
        let rawData = { email: this.state.email, name: this.state.name }
        try {
            await request({
                type: 'post',
                url: 'request',
                options: {
                    ...rawData,
                    fcm: token,
                }
            })
            this.props.showSnack('myUniqueId', {
                label: 'The request has been submitted. Thank you!',
                timeout: 5000,
                button: { label: 'NICE!' }
            });
            this.setState({
                name: '',
                email: '',
            })
        } catch (err) {
            if (!err.response) {
                this.props.showSnack('myErrorId', {
                    label: 'Server is currently under maintenance.',
                    timeout: 3000,
                    button: { label: 'Sorry!' }
                });
            } else {
                const { error } = err.response.data
                this.props.showSnack('myErrorId', {
                    label: error,
                    timeout: 3000,
                    button: { label: 'Sorry!' }
                });
            }

        }
    }

    constructor(props) {
        super(props)
        this.state = {
            name: '',
            email: '',
            data: [],
            filteredData: [],
            hasFetched: false,
            searchTerm: '',
        }
    }

    updateField({ data, field }) {
        this.setState({
            [field]: data
        })
    }

    searchName({ data, field }) {
        this.updateField({ data, field })
        let filteredData
        if (!data.trim()) {
            filteredData = this.state.data
        } else {
            filteredData = this.state.data.filter(row => {
                return row.name.toLowerCase().replace(/\s/g, '').includes(
                    data.toLowerCase().replace(/\s/g, '')
                )
            })
        }
        this.setState({
            filteredData
        })
    }

    responseGoogle = (response) => {
        this.props.loginUser(response)
        console.log(response)
    }

    failedResponse = (response) => {
        if (response.error && response.details) {
            this.props.showSnack('error', { label: response.details, timeout: 5000 })
        }
        console.log(response)
    }

    logout = () => {
        this.props.logout()
    }

    isValidEmail(email) {
        if (!email.endsWith('@student.mmu.edu.my')) {
            return false
        }
        return true
    }

    render() {

        const { isLoggedIn, loginData } = this.props
        const { hasFetched, filteredData } = this.state
        return (
            <div className="d-flex flex-column mt-4">
                <div className="text-center">
                    <h3>Parcel Track MMU V2</h3>
                    <h5>By <a href="https://github.com/dannyongtey">Danny</a></h5>
                    <p>When I got screwed by a problem I screw the problem back.</p>
                    <br />
                    {isLoggedIn ?
                        <div className='text-center'>
                            {this.isValidEmail(loginData.profileObj.email) ?
                                'Logged in as ' + loginData.profileObj.name + '. Welcome!'
                                :
                                'You must use MMU approved student email (ends with @student.mmu.edu.my) to access the functions. Try clearing your cache if you are unable to choose credentials.'
                            }
                            <p><a style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }} onClick={this.logout}>Logout</a></p>
                        </div>
                        :
                        <div>

                        </div>
                    }
                </div>

                {isLoggedIn ?
                    this.isValidEmail(loginData.profileObj.email) ?
                        <div className="row mx-2 mt-5">

                            <div className="py-5 border text-center justify-content-center col-12 col-lg-8 offset-lg-2">
                                <h5>Got a parcel?</h5>
                                <p>Enter your name on the parcel. Try to be as specific as possible, yet generic as necessary to avoid false or failed detection.
                                    <br />
                                    <small>Eg. Jason, Zulkifli, Moinul should be acceptable. The system will look for the best possible match(es).</small>
                                </p>
                                <label>Name on Parcel:</label>
                                <Input placeholder="Jason" value={this.state.name} onChange={(data) => this.updateField({ data, field: 'name' })} />
                                <div className='mt-3'></div>
                                <label>Email to Notify:</label>
                                <Input placeholder="test@example.com" value={this.state.email} onChange={(data) => this.updateField({ data, field: 'email' })} />
                                <button className="mt-3" type="button" onClick={(e) => this.submitRequest()}>
                                    Submit
                                </button>
                            </div>

                            <div className='py-5 border text-center justify-content-center col-12 col-lg-8 offset-lg-2'>
                                <h5>Think your parcel has arrived but didn't get notifications?</h5>
                                {hasFetched ?
                                    <div>
                                        <p>Search for your name below.
                                        <br />
                                            <small>Eg. Jason, Zulkifli, Moinul should be acceptable. The system will look for the best possible match(es).</small>
                                        </p>
                                        <label>Name on Parcel:</label>
                                        <Input placeholder="Jason" onChange={(data) => this.searchName({ data, field: 'searchTerm' })} />
                                        <div class='mt-3'>
                                            <table class='border' style={{ width: '100%' }}>
                                                <tr class='border'>
                                                    <th>Name</th>
                                                    <th>Parcel</th>
                                                    <th>Quantity</th>
                                                    <th>Posted On</th>
                                                </tr>
                                                {
                                                    filteredData.map(row => {
                                                        return (
                                                            <tr class='border'>
                                                                <td>{row.name}</td>
                                                                <td>{row.parcel}</td>
                                                                <td>{row.qty}</td>
                                                                <td>{new Date(row.date).getDate()} / {new Date(row.date).getMonth() + 1} / {new Date(row.date).getFullYear()}
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                }

                                            </table>
                                        </div>
                                    </div>
                                    :
                                    <button className="mt-3" type="button" onClick={(e) => this.getParcels()}>
                                        Search Manually
                                    </button>
                                }

                            </div>

                        </div>
                        :
                        <div></div>
                    :

                    <div
                        style={{ textAlign: 'center' }}>
                        <GoogleLogin
                            clientId="188675003694-3a98hmr4jkt14dhfkargc1cvo5tkblud.apps.googleusercontent.com"
                            buttonText="Login with MMU Account"
                            onSuccess={this.responseGoogle}
                            onFailure={this.failedResponse}
                            cookiePolicy={'single_host_origin'}
                        />
                        <p style={{ marginTop: '20px' }}>This application involves the use of MMU's intellectual property. Hence, you need to prove that you are a MMU student.</p>
                    </div>
                }
            </div>
        )
    }
}
export const mapStateToProps = state => ({
    isLoggedIn: Object.keys(selectAuth(state)).length > 0 ? true : false,
    loginData: selectAuth(state),
})
export const mapDispatchToProps = dispatch => ({
    showSnack: (id, options) => dispatch(showSnack(id, options)),
    loginUser: value => dispatch(loginUser(value)),
    logout: () => dispatch(logoutUser()),
})
export default connect(mapStateToProps, mapDispatchToProps)(Home)